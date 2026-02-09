import { useState, useEffect, useRef } from "react";
import { IoClose, IoArrowBack } from "react-icons/io5";
import { TextField, MenuItem, Radio, RadioGroup, FormControlLabel, FormControl } from '@mui/material';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import mapDesktop from "../../../assets/Common/map-location-desktop.png";
import mapMobile from "../../../assets/Common/map-location-mobile.png";
import "./BookingModal.scss";

export default function BookingModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Location, 2: Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    locationType: 'Home',
    preferredLocation: '',
    interestServiceCity: '',
    interestServiceArea: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapMobileRef = useRef(null);
  const mapMobileInstanceRef = useRef(null);

  // Load Google Maps script and initialize maps
  useEffect(() => {
    if (!isOpen) return;

    const initializeMaps = () => {
      // Initialize desktop map
      if (mapRef.current && !mapInstanceRef.current && window.google && window.google.maps) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 25.2048, lng: 55.2708 }, // Dubai coordinates
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Add click listener to get location
        mapInstanceRef.current.addListener('click', (e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          handleMapLocationSelect(lat, lng);
        });
      }

      // Initialize mobile map
      if (mapMobileRef.current && !mapMobileInstanceRef.current && window.google && window.google.maps) {
        mapMobileInstanceRef.current = new window.google.maps.Map(mapMobileRef.current, {
          center: { lat: 25.2048, lng: 55.2708 }, // Dubai coordinates
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Add click listener to get location
        mapMobileInstanceRef.current.addListener('click', (e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          handleMapLocationSelect(lat, lng);
        });
      }
    };

    const handleMapLocationSelect = (lat, lng) => {
      // Use reverse geocoding to get address
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setSelectedLocation({
              lat,
              lng,
              address: results[0].formatted_address,
            });
            setFormData(prev => ({
              ...prev,
              address: results[0].formatted_address,
            }));
          }
        });
      }
    };

    if (!window.google || !window.google.maps) {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (!existingScript) {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        // Only load if API key is provided
        if (!apiKey || apiKey === 'YOUR_API_KEY') {
          console.warn('Google Maps API key not found. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file');
          return;
        }

        // Create callback function name
        const callbackName = 'initGoogleMaps_' + Date.now();
        window[callbackName] = () => {
          setTimeout(() => initializeMaps(), 100);
          delete window[callbackName];
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}&loading=async`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      } else {
        // Script exists, wait for it to load
        if (window.google && window.google.maps) {
          setTimeout(() => initializeMaps(), 100);
        } else {
          const checkGoogle = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(checkGoogle);
              setTimeout(() => initializeMaps(), 100);
            }
          }, 100);
        }
      }
    } else {
      setTimeout(() => initializeMaps(), 100);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
      if (mapMobileInstanceRef.current) {
        mapMobileInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentStep(1);
      setFormData({
        name: '',
        phone: '',
        locationType: 'Home',
        preferredLocation: '',
        interestServiceCity: '',
        interestServiceArea: '',
        address: '',
      });
      setSelectedLocation(null);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleUpdate = (field) => (event) => {
    const inputValue = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: inputValue }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (phone) => {
    setFormData((prev) => ({ ...prev, phone }));
    if (formErrors.phone) {
      setFormErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setFormData((prev) => ({ ...prev, preferredLocation: location }));
  };

  const handleLocationStepNext = () => {
    // Allow proceeding even without selecting location for now
    // You can add validation later if needed
    setCurrentStep(2);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = "Name is required";
    if (!formData.phone?.trim()) errors.phone = "Phone is required";
    if (!formData.preferredLocation?.trim()) errors.preferredLocation = "Location is required";
    if (!formData.interestServiceCity?.trim()) errors.interestServiceCity = "City is required";
    if (!formData.interestServiceArea?.trim()) errors.interestServiceArea = "Area is required";
    if (!formData.address?.trim()) errors.address = "Address is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle form submission
      console.log('Form submitted:', formData);
      // You can add API call here
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Mobile: Two-step flow */}
        <div className="booking-modal-mobile">
          {currentStep === 1 ? (
            <div className="location-step">
              <div className="step-content-wrapper">
                <div className="step-header">
                  <button className="step-back-btn" onClick={onClose}>
                    <IoArrowBack />
                  </button>
                  <button className="booking-modal-close" onClick={onClose}>
                    <IoClose />
                  </button>
                </div>
                <div className="map-container">
                  <div className="map-search">
                    <TextField
                      placeholder="Search Location"
                      variant="outlined"
                      className="search-location-input"
                      fullWidth
                    />
                  </div>
                  <div className="map-image-wrapper">
                    <img src={mapMobile} alt="Map Location" className="map-placeholder-image" />
                    <div ref={mapMobileRef} className="google-map" style={{ width: '100%', height: '100%', minHeight: '300px' }}></div>
                  </div>
                  {formErrors.preferredLocation && (
                    <div className="error-message">{formErrors.preferredLocation}</div>
                  )}
                  <button className="map-confirm-btn" onClick={handleLocationStepNext}>
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="form-step">
              <div className="step-content-wrapper">
                <div className="step-header">
                  <button className="step-back-btn" onClick={() => setCurrentStep(1)}>
                    <IoArrowBack />
                  </button>
                  <button className="booking-modal-close" onClick={onClose}>
                    <IoClose />
                  </button>
                </div>
                <div className="step-title-section">
                  <h2 className="step-title">Book Now</h2>
                  <p className="step-description">Ready to experience the benefits of Physiotherapy?</p>
                </div>
                <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-field-wrapper">
                  <label className="field-label">Name</label>
                  <TextField
                    placeholder="Name"
                    variant="outlined"
                    value={formData.name}
                    onChange={handleUpdate('name')}
                    fullWidth
                    className="form-field"
                    required
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                  />
                </div>

                <div className="form-field-wrapper">
                  <label className="field-label">Phone</label>
                  <div className="phone-input-wrapper">
                    <PhoneInput
                      country={"ae"}
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      inputProps={{
                        name: "phone",
                        required: true,
                      }}
                      inputStyle={{
                        width: "100%",
                        height: "48px",
                        borderRadius: "8px",
                        border: "1px solid #2196F3",
                        backgroundColor: "white",
                        color: "#333",
                        paddingLeft: "50px",
                        fontSize: "16px",
                        fontFamily: "'Anek Latin', sans-serif",
                        transition: "all 0.3s ease",
                        boxSizing: "border-box",
                      }}
                      buttonStyle={{
                        border: "none",
                        backgroundColor: "transparent",
                        borderRight: "2px solid #2196F3",
                        borderRadius: "8px 0 0 8px",
                      }}
                      containerStyle={{
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                      dropdownStyle={{
                        backgroundColor: "white",
                        color: "#333",
                        borderRadius: "8px",
                        border: "2px solid #2196F3",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      }}
                      searchStyle={{
                        backgroundColor: "white",
                        color: "#333",
                        border: "2px solid #e0e0e0",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                  {formErrors.phone && (
                    <div className="error-message">{formErrors.phone}</div>
                  )}
                </div>

                <div className="form-field-wrapper">
                  <label className="field-label">Location Type</label>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={formData.locationType}
                      onChange={handleUpdate('locationType')}
                    >
                    <FormControlLabel
                      value="Home"
                      control={<Radio sx={{ color: '#2196F3', '&.Mui-checked': { color: '#2196F3' } }} />}
                      label="Home"
                    />
                    <FormControlLabel
                      value="Office"
                      control={<Radio sx={{ color: '#2196F3', '&.Mui-checked': { color: '#2196F3' } }} />}
                      label="Office"
                    />
                    </RadioGroup>
                  </FormControl>
                </div>

                <div className="form-field-wrapper">
                  <label className="field-label">Preferred Location</label>
                  <TextField
                    select
                    variant="outlined"
                    value={formData.preferredLocation}
                    onChange={handleUpdate('preferredLocation')}
                    fullWidth
                    className="form-field"
                    required
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (selected) => {
                        if (!selected) {
                          return <span style={{ color: '#999' }}>Select Location</span>;
                        }
                        return selected;
                      },
                      MenuProps: {
                        style: { zIndex: 10002 },
                        PaperProps: {
                          style: { zIndex: 10002 }
                        }
                      }
                    }}
                    error={!!formErrors.preferredLocation}
                    helperText={formErrors.preferredLocation}
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
                </div>

                <div className="form-row">
                  <div className="form-field-wrapper">
                    <label className="field-label">Interest Service</label>
                    <TextField
                      select
                      placeholder="City"
                      variant="outlined"
                      value={formData.interestServiceCity}
                      onChange={handleUpdate('interestServiceCity')}
                      fullWidth
                      className="form-field"
                      required
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (selected) => {
                          if (!selected) {
                            return <span style={{ color: '#999' }}>City</span>;
                          }
                          return selected;
                        },
                        MenuProps: {
                          style: { zIndex: 10002 },
                          PaperProps: {
                            style: { zIndex: 10002 }
                          }
                        }
                      }}
                      error={!!formErrors.interestServiceCity}
                      helperText={formErrors.interestServiceCity}
                    >
                      <MenuItem value="" disabled>
                        <em>City</em>
                      </MenuItem>
                      <MenuItem value="Dubai">Dubai</MenuItem>
                      <MenuItem value="Abu Dhabi">Abu Dhabi</MenuItem>
                      <MenuItem value="Sharjah">Sharjah</MenuItem>
                    </TextField>
                  </div>

                  <div className="form-field-wrapper">
                    <label className="field-label">&nbsp;</label>
                    <TextField
                      select
                      placeholder="Area"
                      variant="outlined"
                      value={formData.interestServiceArea}
                      onChange={handleUpdate('interestServiceArea')}
                      fullWidth
                      className="form-field"
                      required
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (selected) => {
                          if (!selected) {
                            return <span style={{ color: '#999' }}>Area</span>;
                          }
                          return selected;
                        },
                        MenuProps: {
                          style: { zIndex: 10002 },
                          PaperProps: {
                            style: { zIndex: 10002 }
                          }
                        }
                      }}
                      error={!!formErrors.interestServiceArea}
                      helperText={formErrors.interestServiceArea}
                    >
                      <MenuItem value="" disabled>
                        <em>Area</em>
                      </MenuItem>
                      <MenuItem value="Downtown">Downtown</MenuItem>
                      <MenuItem value="Marina">Marina</MenuItem>
                      <MenuItem value="JBR">JBR</MenuItem>
                      <MenuItem value="Business Bay">Business Bay</MenuItem>
                    </TextField>
                  </div>
                </div>

                <div className="form-field-wrapper">
                  <label className="field-label">Address</label>
                  <TextField
                    variant="outlined"
                    value={formData.address}
                    onChange={handleUpdate('address')}
                    fullWidth
                    className="form-field address-field"
                    placeholder="Enter your address"
                    multiline
                    rows={1}
                    required
                    error={!!formErrors.address}
                    helperText={formErrors.address}
                  />
                </div>

                <button type="submit" className="proceed-btn">
                  Proceed
                </button>
              </form>
              </div>
            </div>
          )}
        </div>

        {/* Desktop: Side-by-side layout */}
        <div className="booking-modal-desktop">
          <div className="map-section">
            <div className="map-container">
              <div className="map-search">
                <TextField
                  placeholder="Search Location"
                  variant="outlined"
                  className="search-location-input"
                  fullWidth
                />
              </div>
              <div className="map-image-wrapper">
                <img src={mapDesktop} alt="Map Location" className="map-placeholder-image" />
                <div ref={mapRef} className="google-map" style={{ width: '100%', height: '100%' }}></div>
              </div>
              <button className="map-confirm-btn" onClick={() => {}}>
                Confirm
              </button>
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-title">Book Online in 30 Sec</h2>
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-field-wrapper">
                <label className="field-label">Name</label>
                <TextField
                  placeholder="Name"
                  variant="outlined"
                  value={formData.name}
                  onChange={handleUpdate('name')}
                  fullWidth
                  className="form-field"
                  required
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </div>

              <div className="form-field-wrapper">
                <label className="field-label">Phone</label>
                <div className="phone-input-wrapper">
                  <PhoneInput
                    country={"ae"}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    inputProps={{
                      name: "phone",
                      required: true,
                    }}
                    inputStyle={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "8px",
                      border: "2px solid #2196F3",
                      backgroundColor: "white",
                      color: "#333",
                      paddingLeft: "50px",
                      fontSize: "16px",
                      fontFamily: "'Anek Latin', sans-serif",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box",
                    }}
                    buttonStyle={{
                      border: "none",
                      backgroundColor: "transparent",
                      borderRight: "2px solid #2196F3",
                      borderRadius: "8px 0 0 8px",
                    }}
                    containerStyle={{
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                    dropdownStyle={{
                      backgroundColor: "white",
                      color: "#333",
                      borderRadius: "8px",
                      border: "2px solid #2196F3",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                    searchStyle={{
                      backgroundColor: "white",
                      color: "#333",
                      border: "2px solid #e0e0e0",
                      borderRadius: "6px",
                    }}
                  />
                </div>
                {formErrors.phone && (
                  <div className="error-message">{formErrors.phone}</div>
                )}
              </div>

              <div className="form-field-wrapper">
                <label className="field-label">Location Type</label>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    value={formData.locationType}
                    onChange={handleUpdate('locationType')}
                  >
                    <FormControlLabel
                      value="Home"
                      control={<Radio sx={{ color: '#2196F3', '&.Mui-checked': { color: '#2196F3' } }} />}
                      label="Home"
                    />
                    <FormControlLabel
                      value="Office"
                      control={<Radio sx={{ color: '#2196F3', '&.Mui-checked': { color: '#2196F3' } }} />}
                      label="Office"
                    />
                  </RadioGroup>
                </FormControl>
              </div>

              <div className="form-field-wrapper">
                <label className="field-label">Preferred Location</label>
                <TextField
                  select
                  variant="outlined"
                  value={formData.preferredLocation}
                  onChange={handleUpdate('preferredLocation')}
                  fullWidth
                  className="form-field"
                  required
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) => {
                      if (!selected) {
                        return <span style={{ color: '#999' }}>Select Location</span>;
                      }
                      return selected;
                    },
                    MenuProps: {
                      style: { zIndex: 10002 },
                      PaperProps: {
                        style: { zIndex: 10002 }
                      }
                    }
                  }}
                  error={!!formErrors.preferredLocation}
                  helperText={formErrors.preferredLocation}
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
              </div>

              <div className="form-row">
                <div className="form-field-wrapper">
                  <label className="field-label">Interest Service</label>
                  <TextField
                    select
                    placeholder="City"
                    variant="outlined"
                    value={formData.interestServiceCity}
                    onChange={handleUpdate('interestServiceCity')}
                    fullWidth
                    className="form-field"
                    required
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (selected) => {
                        if (!selected) {
                          return <span style={{ color: '#999' }}>City</span>;
                        }
                        return selected;
                      },
                      MenuProps: {
                        style: { zIndex: 10002 },
                        PaperProps: {
                          style: { zIndex: 10002 }
                        }
                      }
                    }}
                    error={!!formErrors.interestServiceCity}
                    helperText={formErrors.interestServiceCity}
                  >
                    <MenuItem value="" disabled>
                      <em>City</em>
                    </MenuItem>
                    <MenuItem value="Dubai">Dubai</MenuItem>
                    <MenuItem value="Abu Dhabi">Abu Dhabi</MenuItem>
                    <MenuItem value="Sharjah">Sharjah</MenuItem>
                  </TextField>
                </div>

                <div className="form-field-wrapper">
                  <label className="field-label">&nbsp;</label>
                  <TextField
                    select
                    placeholder="Area"
                    variant="outlined"
                    value={formData.interestServiceArea}
                    onChange={handleUpdate('interestServiceArea')}
                    fullWidth
                    className="form-field"
                    required
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (selected) => {
                        if (!selected) {
                          return <span style={{ color: '#999' }}>Area</span>;
                        }
                        return selected;
                      },
                      MenuProps: {
                        style: { zIndex: 10002 },
                        PaperProps: {
                          style: { zIndex: 10002 }
                        }
                      }
                    }}
                    error={!!formErrors.interestServiceArea}
                    helperText={formErrors.interestServiceArea}
                  >
                    <MenuItem value="" disabled>
                      <em>Area</em>
                    </MenuItem>
                    <MenuItem value="Downtown">Downtown</MenuItem>
                    <MenuItem value="Marina">Marina</MenuItem>
                    <MenuItem value="JBR">JBR</MenuItem>
                    <MenuItem value="Business Bay">Business Bay</MenuItem>
                  </TextField>
                </div>
              </div>

              <div className="form-field-wrapper">
                <label className="field-label">Address</label>
                <TextField
                  variant="outlined"
                  value={formData.address}
                  onChange={handleUpdate('address')}
                  fullWidth
                  className="form-field address-field"
                  placeholder="Enter your address"
                  multiline
                  rows={1}
                  required
                  error={!!formErrors.address}
                  helperText={formErrors.address}
                />
              </div>

              <button type="submit" className="proceed-btn">
                Proceed
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

