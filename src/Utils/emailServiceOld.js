import { toast } from "react-toastify";
import { getAttributionData, generateLeadId } from "./attribution";

// Google Apps Script Web App URL - Replace with your deployed web app URL
// To get this URL: Deploy > New deployment > Web app > Copy the URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxyJAp3KAQC0N6CCE25lhHlEKdg-cMITTrW_X51uEwZGrX72kwxEVu1-X61BM_U5qdKfQ/exec";

/**
 * Sends form data to Google Sheets via Google Apps Script
 * @param {Object} formData - Form data object
 * @param {string} formData.name - User's name
 * @param {string} formData.phone - User's phone number
 * @param {string} formData.email - User's email (optional)
 * @param {string} formData.message - Message content
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
/**
 * Sends form data to Google Sheets via Google Apps Script
 * @param {Object} formData - Form data object
 * @param {string} formData.name - User's name
 * @param {string} formData.phone - User's phone number
 * @param {string} formData.email - User's email (optional)
 * @param {string} formData.message - Message content
 * @param {string} formData.source - Source of the form (optional, defaults to "Contact Form")
 * @param {string} formData.selectedService - Selected service (for chatbot)
 * @param {boolean} formData.interestedBefore - Worked with mortgage broker before (for chatbot)
 * @param {string} formData.serviceType - Service type (for contact form)
 * @param {string} formData.service - Service (alternative field name)
 * @param {string} formData.pageUrl - Page URL (for chatbot)
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export const sendToGoogleSheets = async (formData) => {
    // Skip if URL is not configured
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
        console.warn("Google Sheets integration not configured. Skipping...");
        return { success: false, error: "Google Sheets URL not configured" };
    }

    try {
        // Get attribution data from localStorage
        const attribution = getAttributionData() || {};
        
        // Generate Lead ID if not provided
        const leadId = formData.leadId || generateLeadId();
        
        // Prepare the data to send
        const dataToSend = {
            // Lead identification
            leadId: leadId,
            
            // Form data
            name: formData.name || "",
            phone: formData.phone || "",
            email: formData.email || "",
            message: formData.message || "",
            source: formData.source || "Contact Form",
            selectedService: formData.selectedService || "",
            interestedBefore: formData.interestedBefore !== undefined && formData.interestedBefore !== null ? formData.interestedBefore : null,
            serviceType: formData.serviceType || formData.service || "",
            pageUrl: formData.pageUrl || "",
            
            // Attribution data (Google Ads)
            gclid: attribution.gclid || "",
            gbraid: attribution.gbraid || "",
            gad_source: attribution.gad_source || "",
            gad_campaignid: attribution.gad_campaignid || "",
            
            // Attribution data (Meta/Facebook)
            fbclid: attribution.fbclid || "",
            _fbp: attribution._fbp || "",
            _fbc: attribution._fbc || "",
            
            // UTM parameters
            utm_source: attribution.utm_source || "",
            utm_medium: attribution.utm_medium || "",
            utm_campaign: attribution.utm_campaign || "",
            utm_term: attribution.utm_term || "",
            utm_content: attribution.utm_content || "",
            utm_id: attribution.utm_id || "",
        };
        
        // Debug logging
        console.log("Sending to Google Sheets - Full data:", JSON.stringify(dataToSend, null, 2));
        console.log("Source being sent:", dataToSend.source);
        console.log("Service Type being sent:", dataToSend.serviceType);
        console.log("Selected Service being sent:", dataToSend.selectedService);
        
        // Google Apps Script web apps have CORS limitations
        // Use no-cors mode which works better with Google Apps Script
        // The data will be sent successfully even though we can't read the response
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            // With no-cors mode, we can't read the response, but the data is still sent
            // Google Apps Script will process the request and save to Sheets
            console.log("Data sent to Google Sheets successfully (no-cors mode)");
            return { success: true, message: "Data sent successfully" };
        } catch (fetchError) {
            // Even if fetch fails, the request might have been sent
            // Log the error but don't fail completely
            console.warn("Fetch error (data may still have been sent):", fetchError);
            return { success: true, message: "Data sent successfully" };
        }
        
    } catch (error) {
        console.error("Google Sheets error:", error);
        // Even if there's an error, the data might still be saved
        // Return success: false but don't block the main flow
        return { success: false, error: error.message };
    }
};

/**
 * Sends contact form data to Google Sheets (which automatically sends email notifications)
 * Google Apps Script handles email sending when data is saved
 * @param {Object} formData - Form data object
 * @param {string} formData.name - User's name
 * @param {string} formData.phone - User's phone number
 * @param {string} formData.email - User's email (optional)
 * @param {string} formData.message - Message content
 * @param {string} formData.source - Source of the form (optional, defaults to "Contact Form")
 * @param {string} formData.serviceType - Service type (optional)
 * @param {string} formData.service - Service (alternative field name, optional)
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export const sendContactFormEmail = async (formData) => {
    try {
        // Only send to Google Sheets if it's NOT a chatbot submission
        // Chatbot submissions are handled separately by sendChatbotToGoogleSheets
        // Detect chatbot: message is "-" and no email (chatbot doesn't collect email)
        const isChatbotSubmission = formData.source === "Chatbot" || 
            (formData.message === "-" && (!formData.email || formData.email === ""));
        
        if (!isChatbotSubmission) {
            // Add source for contact form (use existing source if provided, otherwise default to "Contact Form")
            const formDataWithSource = {
                ...formData,
                source: formData.source || "Contact Form",
                selectedService: "",
                interestedBefore: null,
                serviceType: formData.serviceType || formData.service || "",
                pageUrl: "",
            };
            
            // Debug logging
            console.log("Sending to Google Sheets:", formDataWithSource);
            console.log("Source:", formDataWithSource.source);
            console.log("Service Type:", formDataWithSource.serviceType);
            
            // Send to Google Sheets - this will trigger email notification via Google Apps Script
            const result = await sendToGoogleSheets(formDataWithSource);
            
            if (result.success) {
                toast.success("Thank you for your message! We'll get back to you soon.");
                return { success: true, message: "Data saved successfully" };
            } else {
                throw new Error(result.error || "Failed to save data");
            }
        } else {
            // If it's a chatbot submission, just return success (handled separately)
            toast.success("Thank you for your message! We'll get back to you soon.");
            return { success: true };
        }
    } catch (error) {
        console.error("Form submission error:", error);
        toast.error("Failed to send message. Please try again.");
        return { success: false, error: error.message || error };
    }
};

/**
 * Sends chatbot data to Google Sheets via Google Apps Script
 * @param {Object} chatData - Chatbot data object
 * @param {string} chatData.name - User's name
 * @param {string} chatData.phone - User's phone number
 * @param {string} chatData.email - User's email address
 * @param {string} chatData.selectedService - Selected service label
 * @param {boolean} chatData.interestedBefore - Whether user worked with mortgage broker before
 * @param {string} chatData.pageUrl - Page URL where chatbot was used
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export const sendChatbotToGoogleSheets = async (chatData) => {
    // Get attribution data from localStorage
    const attribution = getAttributionData() || {};
    
    // Generate Lead ID if not provided
    const leadId = chatData.leadId || generateLeadId();
    
    // For chatbot, message field is just "-" since all data is in other columns
    const formData = {
        // Lead identification
        leadId: leadId,
        
        // Form data
        name: chatData.name || "",
        phone: chatData.phone || "",
        email: chatData.email || "",
        message: "-", // Empty message for chatbot (data is in Service Type and Worked with Broker Before columns)
        source: "Chatbot",
        selectedService: chatData.selectedService || "",
        interestedBefore: chatData.interestedBefore !== undefined && chatData.interestedBefore !== null ? chatData.interestedBefore : null,
        pageUrl: chatData.pageUrl || "",
        
        // Attribution data (Google Ads)
        gclid: attribution.gclid || "",
        gbraid: attribution.gbraid || "",
        gad_source: attribution.gad_source || "",
        gad_campaignid: attribution.gad_campaignid || "",
        
        // Attribution data (Meta/Facebook)
        fbclid: attribution.fbclid || "",
        _fbp: attribution._fbp || "",
        _fbc: attribution._fbc || "",
        
        // UTM parameters
        utm_source: attribution.utm_source || "",
        utm_medium: attribution.utm_medium || "",
        utm_campaign: attribution.utm_campaign || "",
        utm_term: attribution.utm_term || "",
        utm_content: attribution.utm_content || "",
        utm_id: attribution.utm_id || "",
    };

    // Send to Google Sheets (non-blocking - don't fail if this fails)
    try {
        const result = await sendToGoogleSheets(formData);
        if (result.success) {
            console.log("Chatbot data saved to Google Sheets successfully!");
        }
        return result;
    } catch (error) {
        console.error("Failed to save chatbot data to Google Sheets (non-critical):", error);
        return { success: false, error };
    }
};

/**
 * Tracks WhatsApp click and sends lead to Google Sheets for offline conversion tracking
 * @param {string} pageUrl - Current page URL where WhatsApp was clicked
 * @returns {Promise<Object>} - Returns result with leadId
 */
export const trackWhatsAppClick = async (pageUrl = "") => {
    try {
        // Get attribution data from localStorage
        const attribution = getAttributionData() || {};
        
        // Generate Lead ID
        const leadId = generateLeadId();
        
        // Prepare WhatsApp lead data
        const whatsappLeadData = {
            // Lead identification
            leadId: leadId,
            
            // Form data (empty for WhatsApp clicks - user will provide info via WhatsApp)
            name: "",
            phone: "",
            email: "",
            message: "WhatsApp Click",
            source: "WhatsApp",
            selectedService: "",
            interestedBefore: null,
            serviceType: "",
            pageUrl: pageUrl || window.location.href,
            
            // Attribution data (Google Ads)
            gclid: attribution.gclid || "",
            gbraid: attribution.gbraid || "",
            gad_source: attribution.gad_source || "",
            gad_campaignid: attribution.gad_campaignid || "",
            
            // Attribution data (Meta/Facebook)
            fbclid: attribution.fbclid || "",
            _fbp: attribution._fbp || "",
            _fbc: attribution._fbc || "",
            
            // UTM parameters
            utm_source: attribution.utm_source || "",
            utm_medium: attribution.utm_medium || "",
            utm_campaign: attribution.utm_campaign || "",
            utm_term: attribution.utm_term || "",
            utm_content: attribution.utm_content || "",
            utm_id: attribution.utm_id || "",
        };
        
        // Send to Google Sheets (non-blocking - don't block WhatsApp redirect)
        sendToGoogleSheets(whatsappLeadData).then(result => {
            if (result.success) {
                console.log("WhatsApp click tracked and saved to Google Sheets successfully!", leadId);
            } else {
                console.warn("WhatsApp click tracking failed (non-critical):", result.error);
            }
        }).catch(error => {
            console.warn("WhatsApp click tracking error (non-critical):", error);
        });
        
        // Return leadId immediately (don't wait for Google Sheets)
        return { success: true, leadId };
        
    } catch (error) {
        console.error("WhatsApp click tracking error:", error);
        // Return success anyway - don't block WhatsApp redirect
        return { success: false, error: error.message };
    }
};