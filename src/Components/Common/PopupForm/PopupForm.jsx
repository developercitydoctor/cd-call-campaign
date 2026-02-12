import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatbotToGoogleSheets } from "../../../Utils/emailService";
import './PopupForm.scss';
import logo from "../../../assets/Logo/City-Doctor-Logo-White.svg";
import bannerImage from "../../../assets/Banners/mobile-banner.jpg";
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { TextField, MenuItem, Checkbox, ListItemText } from '@mui/material';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from 'react-toastify';
import { services } from "../../../Constants/services";
import { ESTIMATED_RESPONSE_SECS, ESTIMATED_RESPONSE_LABEL } from "../../../Constants/estimatedResponse";

const EMIRATES_OPTIONS = ["Dubai", "Abu Dhabi", "Sharjah"];

function PopupForm({ handleClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emirates: '',
    symptoms: [],
  });

  const [formErrors, setFormErrors] = useState({});
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateErrors = () => {
    const errors = {};
    if (formData?.name?.trim()?.length === 0) errors.name = "Name is required";
    if (formData?.phone?.trim()?.length === 0) errors.phone = "Phone number is required";
    if (!formData?.emirates?.trim()) errors.emirates = "Please select your Emirates";
    if (!formData?.symptoms?.length) errors.symptoms = "Please select at least one symptom";
    return errors;
  };

  const handleUpdate = (field) => (event) => {
    const inputValue = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: inputValue }));
  };

  const handleSymptomsChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      symptoms: typeof value === "string" ? value.split(",") : value,
    }));
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

      const symptomsString = Array.isArray(formData.symptoms) ? formData.symptoms.join("\n") : "";

      const result = await sendChatbotToGoogleSheets({
        name: formData.name.trim(),
        phone: formData.phone,
        emirates: formData.emirates.trim(),
        symptoms: symptomsString,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      });

      if (result.success) {
        setResponse(`Your form has been submitted successfully. Our team will get back to you within ${ESTIMATED_RESPONSE_SECS} seconds.`);
        toast.success("Your form has been submitted successfully.");
        setFormData({ name: '', phone: '', emirates: '', symptoms: [] });
        setFormErrors({});
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
              {/* <img src={logo} alt="City Doctor" className="popup-logo" /> */}
              <h1 className="popup-title">Book a Doctor<br/> at Your Doorstep</h1>
              {/* <p className="popup-subtitle">
                Fill in your details and our medical consultants will reach out to you shortly.
              </p> */}
            </div>

            <div className="popup-live-banner">
              <span className="live-dot" aria-hidden />
              <div className="live-banner-text">
                <span className="live-title">Our Medical Consultants are Online…</span>
                <span className="live-subtitle">Est. Call Back Time: {ESTIMATED_RESPONSE_LABEL}</span>
              </div>
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
                select
                label="Emirates"
                variant="outlined"
                value={formData.emirates}
                onChange={handleUpdate("emirates")}
                fullWidth
                className="form-field"
                required
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (v) => (v ? v : ""),
                  MenuProps: { sx: { zIndex: 9999 } },
                }}
              >
                {EMIRATES_OPTIONS.map((em) => (
                  <MenuItem key={em} value={em}>{em}</MenuItem>
                ))}
              </TextField>
              {formErrors.emirates && <div className="error-message">{formErrors.emirates}</div>}

              <TextField
                select
                label="Symptoms (select multiple)"
                variant="outlined"
                value={formData.symptoms || []}
                onChange={handleSymptomsChange}
                fullWidth
                className="form-field"
                required
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (selected && selected.length ? selected.join(", ") : ""),
                  MenuProps: {
                    sx: { zIndex: 9999 },
                    PaperProps: { sx: { maxHeight: 220 } },
                  },
                }}
              >
                {services.map((service) => (
                  <MenuItem key={service.id} value={service.title}>
                    <Checkbox checked={(formData.symptoms || []).indexOf(service.title) > -1} size="small" sx={{ color: "rgba(255,255,255,0.7)", "&.Mui-checked": { color: "#25D366" } }} />
                    <ListItemText primary={service.title} primaryTypographyProps={{ fontSize: "14px" }} />
                  </MenuItem>
                ))}
              </TextField>
              {formErrors.symptoms && <div className="error-message">{formErrors.symptoms}</div>}

              <button type="submit" className="btn secondary-btn" disabled={isLoading}>
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