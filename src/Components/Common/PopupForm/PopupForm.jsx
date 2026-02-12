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
import { ESTIMATED_RESPONSE_TIME_SEC, ESTIMATED_RESPONSE_LABEL } from "../../../Constants/estimatedResponse";

const EMIRATES_OPTIONS = ["Dubai", "Abu Dhabi", "Sharjah"];
const SYMPTOM_OTHER = "Other";
const SYMPTOM_DONE = "__done__"; // sentinel to close menu, not stored in form

function PopupForm({ handleClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emirates: '',
    symptoms: [],
    symptomsOther: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [symptomsMenuOpen, setSymptomsMenuOpen] = useState(false);

  const validateErrors = () => {
    const errors = {};
    if (formData?.name?.trim()?.length === 0) errors.name = "Name is required";
    if (formData?.phone?.trim()?.length === 0) errors.phone = "Phone number is required";
    if (!formData?.emirates?.trim()) errors.emirates = "Please select your Emirates";
    if (!formData?.symptoms?.length) errors.symptoms = "Please select at least one symptom";
    const hasOther = (formData?.symptoms || []).includes(SYMPTOM_OTHER);
    if (hasOther && !formData?.symptomsOther?.trim()) errors.symptomsOther = "Please specify your other symptoms";
    return errors;
  };

  const handleUpdate = (field) => (event) => {
    const inputValue = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: inputValue }));
  };

  const handleSymptomsChange = (event) => {
    const value = event.target.value;
    const list = typeof value === "string" ? value.split(",") : value;
    if (list.includes(SYMPTOM_DONE)) {
      setFormData((prev) => ({
        ...prev,
        symptoms: list.filter((s) => s !== SYMPTOM_DONE),
      }));
      setTimeout(() => setSymptomsMenuOpen(false), 0);
    } else {
      setFormData((prev) => ({
        ...prev,
        symptoms: list,
      }));
    }
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

      const symptomsList = Array.isArray(formData.symptoms) ? formData.symptoms.filter((s) => s !== SYMPTOM_OTHER) : [];
      const hasOther = (formData.symptoms || []).includes(SYMPTOM_OTHER);
      const otherText = hasOther && formData.symptomsOther?.trim() ? formData.symptomsOther.trim() : "";
      const symptomsParts = [...symptomsList];
      if (otherText) symptomsParts.push(`${SYMPTOM_OTHER}: ${otherText}`);
      const symptomsString = symptomsParts.join("\n");

      const result = await sendChatbotToGoogleSheets({
        name: formData.name.trim(),
        phone: formData.phone,
        emirates: formData.emirates.trim(),
        symptoms: symptomsString,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      });

      if (result.success) {
        if (typeof window !== "undefined") {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "chatbot_form_conversion",
            eventCategory: "Chatbot",
            eventAction: "form_submitted",
            eventLabel: "Thank you page redirect",
          });
        }
        setResponse(`Your form has been submitted successfully. Our team will get back to you shortly. Est. response time: ${ESTIMATED_RESPONSE_TIME_SEC} seconds.`);
        toast.success("Your form has been submitted successfully.");
        setFormData({ name: '', phone: '', emirates: '', symptoms: [], symptomsOther: '' });
        setFormErrors({});
        setTimeout(() => {
          navigate("/thank-you", { state: { fromSubmit: true, symptoms: symptomsParts } });
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
                <span className="live-title">Our medical team is online</span>
                <span className="live-subtitle">We will call back you in {ESTIMATED_RESPONSE_TIME_SEC} seconds</span>
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
                  open: symptomsMenuOpen,
                  onOpen: () => setSymptomsMenuOpen(true),
                  onClose: () => setSymptomsMenuOpen(false),
                  renderValue: (selected) => {
                    const list = (selected || []).filter((s) => s !== SYMPTOM_DONE);
                    return list.length ? list.join(", ") : "";
                  },
                  MenuProps: {
                    sx: { zIndex: 9999 },
                    PaperProps: {
                      sx: {
                        maxHeight: 320,
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#fff",
                        "& .MuiMenuItem-root": { color: "#333" },
                        "& .MuiListItemText-primary": { color: "#333" },
                      },
                    },
                    ListProps: {
                      sx: {
                        maxHeight: 240,
                        overflowY: "auto",
                        paddingBottom: 0,
                      },
                    },
                    autoFocus: false,
                  },
                }}
              >
                {services.map((service) => (
                  <MenuItem key={service.id} value={service.title}>
                    <Checkbox
                      checked={(formData.symptoms || []).indexOf(service.title) > -1}
                      size="small"
                      sx={{
                        color: "rgba(0,0,0,0.75)",
                        "&.Mui-checked": { color: "#25D366" },
                      }}
                    />
                    <ListItemText primary={service.title} primaryTypographyProps={{ fontSize: "14px" }} />
                  </MenuItem>
                ))}
                <MenuItem value={SYMPTOM_OTHER}>
                  <Checkbox
                    checked={(formData.symptoms || []).indexOf(SYMPTOM_OTHER) > -1}
                    size="small"
                    sx={{
                      color: "rgba(0,0,0,0.75)",
                      "&.Mui-checked": { color: "#25D366" },
                    }}
                  />
                  <ListItemText primary={SYMPTOM_OTHER} primaryTypographyProps={{ fontSize: "14px" }} />
                </MenuItem>
                <MenuItem
                  value={SYMPTOM_DONE}
                  className="symptoms-done-item"
                  sx={{
                    justifyContent: "center",
                    fontWeight: 600,
                    position: "sticky",
                    bottom: 0,
                    backgroundColor: "#e8e8e8",
                    borderTop: "1px solid #ccc",
                    pt: 1.5,
                    mt: 0.5,
                    flexShrink: 0,
                    zIndex: 1,
                    "&:hover": { backgroundColor: "#d8d8d8" },
                  }}
                >
                  Done
                </MenuItem>
              </TextField>
              {formErrors.symptoms && <div className="error-message">{formErrors.symptoms}</div>}

              {(formData.symptoms || []).includes(SYMPTOM_OTHER) && (
                <>
                  <TextField
                    label="Please specify (other symptoms)"
                    variant="outlined"
                    value={formData.symptomsOther}
                    onChange={handleUpdate("symptomsOther")}
                    fullWidth
                    className="form-field"
                    placeholder="Describe your symptoms..."
                  />
                  {formErrors.symptomsOther && <div className="error-message">{formErrors.symptomsOther}</div>}
                </>
              )}

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