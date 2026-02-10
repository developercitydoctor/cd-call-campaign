import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatbotToGoogleSheets } from "../../../Utils/emailService";
import './PopupForm.scss';
import logo from "../../../assets/Logo/City-Doctor-Logo-White.svg";
import bannerImage from "../../../assets/Banners/mobile-banner.jpg";
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { TextField } from '@mui/material';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from 'react-toastify';

function PopupForm({ handleClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    symptoms: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateErrors = () => {
    const errors = {};
    if (formData?.name?.trim()?.length === 0) errors.name = "Name is required";
    if (formData?.phone?.trim()?.length === 0) errors.phone = "Phone number is required";
    if (formData?.symptoms?.trim()?.length === 0) errors.symptoms = "Please describe your symptoms or health concern";
    return errors;
  };

  const handleUpdate = (field) => (event) => {
    const inputValue = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: inputValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateErrors();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      setResponse("");

      const result = await sendChatbotToGoogleSheets({
        name: formData.name.trim(),
        phone: formData.phone,
        symptoms: formData.symptoms.trim(),
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      });

      if (result.success) {
        setResponse("Your form has been submitted successfully. Our team will get back to you shortly.");
        toast.success("Your form has been submitted successfully.");
        setFormData({ name: '', phone: '', symptoms: '' });
        setFormErrors({});
        // Keep popup open, show success message; after 3s navigate and close popup during navigation
        setTimeout(() => {
          navigate("/thank-you");
          handleClose();
        }, 3000);
      } else {
        setResponse("Something went wrong. Please try again.");
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setResponse("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="popup-modal-overlay"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="popup-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="closeButton" onClick={handleClose} type="button" aria-label="Close">
            <IoClose />
          </button>

          <div className="popup-background">
            <img src={bannerImage} alt="City Doctor" />
            <div className="background-overlay"></div>
          </div>

          <div className="popup-content">
            <div className="popup-header">
              <img src={logo} alt="City Doctor" className="popup-logo" />
              <h1 className="popup-title">Book a Doctor at Your Doorstep</h1>
              <p className="popup-subtitle">
                Fill in your details and our medical team will contact you within 30–45 minutes. Available 24/7.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="popup-form">
              <TextField
                label="Name"
                variant="outlined"
                value={formData.name}
                onChange={handleUpdate('name')}
                fullWidth
                className="form-field"
                required
              />
              {formErrors.name && <div className="error-message">{formErrors.name}</div>}

              <PhoneInput
                country={"ae"}
                value={formData.phone}
                onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                inputProps={{
                  name: "phone",
                  required: true,
                }}
                inputStyle={{
                  width: "100%",
                  height: "56px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "20px",
                  paddingLeft: "50px",
                  fontSize: "16px",
                  fontFamily: '"Anek Latin", sans-serif',
                  background: "transparent",
                  color: "white",
                  transition: "all 0.3s ease",
                }}
                buttonStyle={{
                  border: "none",
                  borderRight: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "20px 0 0 20px",
                  backgroundColor: "transparent",
                }}
                containerStyle={{
                  width: "100%",
                }}
                dropdownStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                  color: "white",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
                searchStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              />
              {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}

              <TextField
                label="Symptoms or health concern"
                variant="outlined"
                multiline
                rows={4}
                value={formData.symptoms}
                onChange={handleUpdate('symptoms')}
                fullWidth
                className="form-field"
                required
                placeholder="Describe your symptoms or what you need help with..."
              />
              {formErrors.symptoms && <div className="error-message">{formErrors.symptoms}</div>}

              <button type="submit" className="btn primary-btn" disabled={isLoading}>
                {isLoading ? "Sending..." : "Submit & Get a Call Back"}
              </button>
              {response && (
                <div className={`response-message ${response.includes("submitted successfully") ? "success" : "error"}`}>
                  {response}
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PopupForm;
