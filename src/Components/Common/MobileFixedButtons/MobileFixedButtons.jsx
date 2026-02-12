import { useEffect, useState } from "react";
import "./MobileFixedButtons.scss";
import { FaPhoneAlt } from "react-icons/fa";
import { useChatbot } from "../../../Context/ChatbotContext";
import { ESTIMATED_RESPONSE_LABEL } from "../../../Constants/estimatedResponse";

export default function MobileFixedButtons() {
  const { openPopupForm, isPopupFormOpen } = useChatbot();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (isPopupFormOpen) return;
    let hideTimer = null;
    const interval = setInterval(() => {
      setShowHint(true);
      hideTimer = setTimeout(() => setShowHint(false), 3000);
    }, 10000);
    return () => {
      clearInterval(interval);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isPopupFormOpen]);

  return (
    <div className="mobile-fixed-buttons">
      <div className={`call-hint ${showHint ? "show" : ""}`}>
        <div className="call-hint-line">
          <span className="call-hint-dot" aria-hidden />
          <span className="call-hint-title">Our Medical Consultants are Online…</span>
        </div>
        <span className="call-hint-time">Est. Response: {ESTIMATED_RESPONSE_LABEL}</span>
      </div>
      <button
        type="button"
        className="fixed-btn call-btn"
        onClick={openPopupForm}
        aria-label="Call now"
      >
        <FaPhoneAlt className="btn-icon" />
      </button>
    </div>
  );
}

