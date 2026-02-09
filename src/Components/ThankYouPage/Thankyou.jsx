import React, { useEffect } from "react";
import "./ThankYou.css";
import useIsMobile from "../../Utils/useIsMobile";
import Helmet from "../../General/Helmet";
import bannerImage from "../../assets/Banners/Landing-Page-Banner.png";
import mobileBannerImage from "../../assets/Banners/mobile-banner.jpg";

export default function Thankyou() {
    const isMobile = useIsMobile(768);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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