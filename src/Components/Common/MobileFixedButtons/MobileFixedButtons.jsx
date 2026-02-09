import { FaWhatsapp } from "react-icons/fa";
import "./MobileFixedButtons.scss";
import phoneIcon from "../../../assets/Icons/phone-icon.png";
import { openWhatsAppWithLeadTracking } from "../../../Utils/emailService";

export default function MobileFixedButtons() {
  // const { openModal } = useBookingModal();

  return (
    <div className="mobile-fixed-buttons">
      <a
        href="https://wa.me/+971551548684"
        className="fixed-btn whatsapp-btn"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => openWhatsAppWithLeadTracking(e, "MobileFixed")}
      >
        <FaWhatsapp className="btn-icon" />
        <span className="btn-text">WhatsApp</span>
      </a>
      <a 
        // onClick={openModal}
        href="tel:+971551548684"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed-btn book-online-btn"
        // style={{ background: '#2096F3', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        <img src={phoneIcon} alt="Phone" className="btn-icon" />
        <span className="btn-text">Call Now</span>
      </a>
    </div>
  );
}

