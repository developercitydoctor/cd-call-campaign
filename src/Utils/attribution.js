/**
 * Attribution Parameter Capture Utility
 * Captures and stores ad attribution parameters (gclid, fbclid, UTM params) on page load
 * These parameters are critical for offline conversion tracking
 */

// Storage key for attribution data
const ATTRIBUTION_STORAGE_KEY = 'ad_attribution_data';

/**
 * Get URL parameter value
 */
const getUrlParam = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || null;
};

/**
 * Get cookie value
 */
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

/**
 * Generate unique Patient Reference ID
 * Format: REF-YYYYMMDD-XXXXX
 */
export const generateLeadId = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `REF-${dateStr}-${randomStr}`;
};

/**
 * Capture all attribution parameters from URL and cookies
 * Must be called on page load (before any navigation)
 */
export const captureAttributionParams = () => {
    const attribution = {
        // Google Ads parameters
        gclid: getUrlParam('gclid'),
        gbraid: getUrlParam('gbraid'),
        gad_source: getUrlParam('gad_source'),
        gad_campaignid: getUrlParam('gad_campaignid'),
        
        // Meta/Facebook parameters
        fbclid: getUrlParam('fbclid'),
        _fbp: getCookie('_fbp'),
        _fbc: getCookie('_fbc'),
        
        // UTM parameters
        utm_source: getUrlParam('utm_source'),
        utm_medium: getUrlParam('utm_medium'),
        utm_campaign: getUrlParam('utm_campaign'),
        utm_term: getUrlParam('utm_term'),
        utm_content: getUrlParam('utm_content'),
        utm_id: getUrlParam('utm_id'),
        
        // Timestamp when captured
        captured_at: new Date().toISOString(),
        
        // Page URL where captured
        landing_page: window.location.href,
    };
    
    // Only store if we have at least one attribution parameter
    const hasAttribution = attribution.gclid || attribution.fbclid || attribution.utm_source;
    
    if (hasAttribution) {
        // Store in localStorage (persists across page navigation)
        localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
        console.log('Attribution parameters captured:', attribution);
    }
    
    return attribution;
};

/**
 * Get stored attribution data
 * Returns null if no attribution data exists
 */
export const getAttributionData = () => {
    try {
        const stored = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Error reading attribution data:', error);
        return null;
    }
};

/**
 * Clear attribution data (optional - for testing or privacy)
 */
export const clearAttributionData = () => {
    localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
};

/**
 * Initialize attribution capture on page load
 * Call this in App.jsx or main.jsx
 */
export const initAttributionCapture = () => {
    // Capture on initial page load
    captureAttributionParams();
    
    // Also capture on any subsequent navigation (if using React Router)
    // This ensures we capture params even if user navigates within the site
    window.addEventListener('popstate', () => {
        captureAttributionParams();
    });
};

