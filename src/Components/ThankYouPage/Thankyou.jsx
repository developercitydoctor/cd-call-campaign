import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./ThankYou.css";
import useIsMobile from "../../Utils/useIsMobile";
import Helmet from "../../General/Helmet";
import bannerImage from "../../assets/Banners/Landing-Page-Banner.png";
import mobileBannerImage from "../../assets/Banners/mobile-banner.jpg";

const WHATSAPP_URL = "https://wa.me/971551548684";

function buildWhatsAppLink(symptoms) {
    const symptomsText = Array.isArray(symptoms) && symptoms.length > 0
        ? symptoms.join(", ")
        : "Medical service inquiry";
    const message = `Hi,\nI need a doctor home visit please.\n\nSymptoms: ${symptomsText}`;
    return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

export default function Thankyou() {
    const isMobile = useIsMobile(768);
    const location = useLocation();
    const state = location.state || {};
    const fromSubmit = !!state && Array.isArray(state.symptoms);

    const [countdown, setCountdown] = useState(fromSubmit ? 1 : 0);

    const symptomsForMessage = (() => {
        if (!fromSubmit || !state.symptoms) return [];
        const list = [...state.symptoms];
        const hasOther = list.includes("Other");
        const otherText = state.symptomsOther?.trim();
        const parts = list.filter((s) => s !== "Other");
        if (hasOther && otherText) parts.push(`Other: ${otherText}`);
        else if (hasOther) parts.push("Other");
        return parts;
    })();

    const whatsappLink = fromSubmit ? buildWhatsAppLink(symptomsForMessage) : null;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!fromSubmit || countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [fromSubmit, countdown]);

    useEffect(() => {
        if (!fromSubmit || !whatsappLink || countdown > 0) return;
        const redirectTimer = setTimeout(() => {
            window.location.href = whatsappLink;
        }, 1000);
        return () => clearTimeout(redirectTimer);
    }, [fromSubmit, whatsappLink, countdown]);

    return (
        <>
            <Helmet title="City Doctor | Thank You" />
            <div className="thankyou-hero">
                <div className="thankyou-banner-background">
                    <img
                        className="thankyou-banner-image"
                        src={isMobile ? mobileBannerImage : bannerImage}
                        alt="Thank You"
                    />
                </div>
                <div className="thankyou-hero-content">
                    <h1 className="thankyou-content-title">Thank You</h1>
                    <p className="thankyou-content-description">We'll get back to you soon.</p>
                    {fromSubmit && (
                        <div className="thankyou-redirect-glass">
                            <p className="thankyou-redirect-text">You are being redirected to City Doctor WhatsApp...</p>
                            <p className="thankyou-countdown">Redirecting in <span className="thankyou-countdown-number">{countdown}</span> sec</p>
                            {countdown <= 0 && (
                                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="thankyou-whatsapp-link">
                                    Open WhatsApp
                                </a>
                            )}
                        </div>
                    )}
                    <a href="/">
                        <button type="button" className="btn primary-btn thankyou-content-button">
                            Back To Home
                        </button>
                    </a>
                </div>
            </div>
        </>
    );
} 