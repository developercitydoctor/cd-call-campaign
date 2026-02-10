import "./MobileFixedButtons.scss";
import { FaPhone } from "react-icons/fa";
import { useChatbot } from "../../../Context/ChatbotContext";

export default function MobileFixedButtons() {
  const { openPopupForm } = useChatbot();

  return (
    <div className="mobile-fixed-buttons">
      <button
        type="button"
        className="fixed-btn call-btn"
        onClick={openPopupForm}
        aria-label="Call now"
      >
        <FaPhone className="btn-icon" />
      </button>
    </div>
  );
}

