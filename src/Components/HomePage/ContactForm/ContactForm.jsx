import { useState } from "react";
import { TextField, MenuItem } from '@mui/material';
import { useNavigate } from "react-router-dom";
import "./ContactForm.scss";
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css";
import { sendContactFormEmail } from "../../../Utils/emailService";

export default function ContactForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: '',
        service: '',
        comments: '',
    });

    const [formErrors, setFormErrors] = useState({});
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const errors = {};

    const validateErrors = () => {
        if (formData?.name?.trim()?.length === 0) errors.name = "Name is Required";
        if (formData?.phone?.trim()?.length === 0) errors.phone = "Phone No is Required";
        if (formData?.location?.trim()?.length === 0) errors.location = "Location is Required";
        if (formData?.service?.trim()?.length === 0) errors.service = "Please select a service";
    };

    const handleUpdate = (field) => (event) => {
        const inputValue = event.target.value;
        setFormData((prev) => ({ ...prev, [field]: inputValue }));
    };

    const handleSendEmail = async (formData) => {
        try {
            setIsLoading(true);
            setResponse("");
            // Map formData to match email service expectations
            const emailData = {
                name: formData.name,
                phone: formData.phone,
                email: '', // Not in new form
                message: formData.comments || 'Request A Call Back',
                service: formData.service,
                location: formData.location,
            };
            const result = await sendContactFormEmail(emailData);
            if (result.success) {
                setResponse("Email sent successfully!");
                setFormData({
                    name: "",
                    phone: "",
                    location: "",
                    service: "",
                    comments: "",
                });
                setFormErrors({});
                setTimeout(() => {
                    navigate("/thank-you");
                }, 3000);
            } else {
                setResponse("Failed to send email. Please try again.");
            }
        } catch (error) {
            console.error("Email sending error:", error);
            setResponse("Failed to send email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        validateErrors();

        if (Object.keys(errors).length === 0) {
            handleSendEmail(formData);
        } else {
            console.log(errors);
            setFormErrors(errors);
        }
    };

    return (
        <section id="contact-us">
            <div className="contact-form-section section-container">
                <form onSubmit={handleSubmit} className="contact-form">
                    <h1 className="form-title">Request A Call Back</h1>
                    <p className="form-description">
                        Share your details and we'll call you back shortly to assist with booking, pricing, or medical guidance 24/7.
                    </p>

                    <div className="form-row">
                        <div className="form-field-wrapper">
                            <label className="field-label">Full Name</label>
                            <TextField 
                                placeholder="Full Name" 
                                variant="outlined" 
                                value={formData.name} 
                                onChange={handleUpdate('name')} 
                                fullWidth 
                                className="form-field"
                                required
                            />
                            {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                        </div>

                        <div className="form-field-wrapper">
                            <label className="field-label">Phone Number</label>
                            <TextField 
                                placeholder="Phone Number" 
                                variant="outlined" 
                                value={formData.phone} 
                                onChange={handleUpdate('phone')} 
                                fullWidth 
                                className="form-field"
                                required
                            />
                            {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                        </div>

                        {/* <div className="form-field-wrapper">
                            <label className="field-label">Phone</label>
                            <PhoneInput
                                country={"ae"}
                                value={formData.phone}
                                onChange={(phone) => {
                                    setFormData((prev) => ({ ...prev, phone }));
                                }}
                                inputProps={{
                                    name: "phone",
                                    required: true,
                                }}
                                inputStyle={{
                                    width: "100%",
                                    height: "40px",
                                    border: "1px solid #ddd",
                                    borderLeft: "none",
                                    borderRadius: "0 10px 10px 0",
                                    backgroundColor: "white",
                                    color: "#333",
                                    paddingLeft: "80px",
                                    paddingRight: "14px",
                                    fontSize: "16px",
                                }}
                                buttonStyle={{
                                    height: "40px",
                                    border: "1px solid #ddd",
                                    borderRight: "1px solid #ddd",
                                    backgroundColor: "white",
                                    borderRadius: "10px 0 0 10px",
                                    paddingLeft: "12px",
                                    paddingRight: "8px",
                                    minWidth: "70px",
                                }}
                                containerStyle={{
                                    width: "100%",
                                    position: "relative",
                                }}
                                dropdownStyle={{
                                    backgroundColor: "white",
                                    color: "#333",
                                    borderRadius: "10px",
                                    border: "1px solid #ddd",
                                }}
                                searchStyle={{
                                    backgroundColor: "white",
                                    color: "#333",
                                    border: "1px solid #ddd",
                                }}
                            />
                            {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                        </div> */}
                    </div>

                    <div className="form-row">
                        <div className="form-field-wrapper">
                            <label className="field-label">Preferred Location</label>
                            <TextField 
                                select 
                                variant="outlined" 
                                value={formData.location} 
                                onChange={handleUpdate('location')} 
                                fullWidth 
                                className="form-field"
                                required
                                displayEmpty
                                SelectProps={{
                                    displayEmpty: true,
                                    renderValue: (selected) => {
                                        if (!selected) {
                                            return <span style={{ color: '#999' }}>Select Location</span>;
                                        }
                                        return selected;
                                    }
                                }}
                            >
                                <MenuItem value="" disabled>
                                    <em>Select Location</em>
                                </MenuItem>
                                <MenuItem value="Dubai">Dubai</MenuItem>
                                <MenuItem value="Abu Dhabi">Abu Dhabi</MenuItem>
                                <MenuItem value="Sharjah">Sharjah</MenuItem>
                                <MenuItem value="Al Ain">Al Ain</MenuItem>
                                <MenuItem value="Ajman">Ajman</MenuItem>
                                <MenuItem value="Ras Al Khaimah">Ras Al Khaimah</MenuItem>
                            </TextField>
                            {formErrors.location && <div className="error-message">{formErrors.location}</div>}
                        </div>

                        <div className="form-field-wrapper">
                            <label className="field-label">Select Service</label>
                            <TextField 
                                select 
                                variant="outlined" 
                                value={formData.service} 
                                onChange={handleUpdate('service')} 
                                fullWidth 
                                className="form-field"
                                required
                                displayEmpty
                                SelectProps={{
                                    displayEmpty: true,
                                    renderValue: (selected) => {
                                        if (!selected) {
                                            return <span style={{ color: '#999' }}>Select Service</span>;
                                        }
                                        return selected;
                                    }
                                }}
                            >
                                <MenuItem value="" disabled>
                                    <em>Select Service</em>
                                </MenuItem>
                                <MenuItem value="Doctor Home Visits">Doctor Home Visits</MenuItem>
                                <MenuItem value="Nurse Home Visits">Nurse Home Visits</MenuItem>
                                <MenuItem value="Lab Tests at Home">Lab Tests at Home</MenuItem>
                                <MenuItem value="Sick Day IV Drips">Sick Day IV Drips</MenuItem>
                                <MenuItem value="Physiotherapy">Physiotherapy</MenuItem>
                            </TextField>
                            {formErrors.service && <div className="error-message">{formErrors.service}</div>}
                        </div>
                    </div>

                    <div className="form-field-wrapper">
                        <label className="field-label">Additional Comments</label>
                        <TextField 
                            variant="outlined" 
                            multiline 
                            rows={2} 
                            placeholder="Enter your comments here..."
                            value={formData.comments} 
                            onChange={handleUpdate('comments')} 
                            fullWidth 
                            className="form-field textarea-field"
                        />
                    </div>

                    <div className="form-submit-wrapper">
                        <button type="submit" className="btn-solid-blue" disabled={isLoading}>
                            {isLoading ? "Sending..." : "Submit"}
                        </button>
                        {response && (
                            <div className={`response-message ${response.includes("successfully") ? "success" : "error"}`}>
                                {response}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </section>
    );
}
