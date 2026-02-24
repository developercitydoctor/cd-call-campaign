/**
 * Per-country phone validation and length limits.
 * Used with react-phone-input-2: value is digits only (country code + national number).
 */

// Max total digits (country code + national number) per dial code.
// UAE: 971 + 9 = 12. Other common countries included; rest use DEFAULT_MAX.
const MAX_DIGITS_BY_DIAL_CODE = {
    "971": 12,  // UAE
    "966": 12,  // Saudi Arabia
    "965": 11,  // Kuwait
    "974": 11,  // Qatar
    "973": 11,  // Bahrain
    "968": 11,  // Oman
    "1": 11,    // US/Canada
    "44": 12,   // UK
    "91": 12,   // India
    "49": 13,   // Germany
    "33": 11,   // France
    "81": 12,   // Japan
    "86": 12,   // China
    "61": 12,   // Australia
    "234": 13,  // Nigeria
    "20": 11,   // Egypt
    "27": 11,   // South Africa
};
const DEFAULT_MAX = 15;
const MIN_DIGITS = 10;

/** UAE: max characters in the formatted input (e.g. "+971 589 313 722" = 16). 12 digits only. */
export const UAE_PHONE_MAX_LENGTH = 16;

/**
 * Get max allowed digit length for a dial code.
 * @param {string} dialCode - e.g. "971", "1"
 * @returns {number}
 */
export function getMaxPhoneLength(dialCode) {
    if (!dialCode) return DEFAULT_MAX;
    const code = String(dialCode).replace(/\D/g, "");
    return MAX_DIGITS_BY_DIAL_CODE[code] ?? DEFAULT_MAX;
}

/**
 * Sanitize phone to digits only and truncate to country max length.
 * Use in PhoneInput onChange(phone, country).
 * UAE: strictly 12 digits (971 + 9). Other countries by dial code.
 * @param {string} phone - value from react-phone-input-2 (may include + etc.)
 * @param {object} country - country from onChange(phone, country); has .dialCode, .countryCode
 * @returns {string} digits only, max length for that country
 */
export function sanitizeAndLimitPhone(phone, country) {
    const digitsOnly = String(phone ?? "").replace(/\D/g, "");
    const dialCode = (country && country.dialCode) ? String(country.dialCode).replace(/\D/g, "") : "";
    const isUAE = (country && country.countryCode === "ae") || dialCode === "971" || digitsOnly.startsWith("971");
    const maxLen = isUAE ? 12 : getMaxPhoneLength(dialCode || "971");
    return digitsOnly.slice(0, maxLen);
}

/**
 * Validate phone for the given country (digit length and format).
 * UAE: exactly 12 digits starting with 971.
 * Others: length between MIN_DIGITS and country max, digits only.
 * @param {string} phone - digits only (e.g. "971589313722")
 * @param {object} country - country object with .dialCode and optionally .countryCode
 * @returns {boolean}
 */
export function validatePhoneForCountry(phone, country) {
    const digits = String(phone ?? "").replace(/\D/g, "");
    if (digits.length < MIN_DIGITS) return false;
    const dialCode = (country && country.dialCode) ? String(country.dialCode).replace(/\D/g, "") : "";
    const maxLen = getMaxPhoneLength(dialCode || "971");

    if (digits.length > maxLen) return false;

    // UAE: must start with 971 and have exactly 12 digits
    if (dialCode === "971" || digits.startsWith("971")) {
        return digits.length === 12 && digits.startsWith("971");
    }

    return true;
}

/**
 * Validate UAE phone only (971 + 9 digits). Use when form is UAE-only.
 * @param {string} phone - can include + or spaces
 * @returns {boolean}
 */
export function validateUAEPhone(phone) {
    const digits = String(phone ?? "").replace(/\D/g, "");
    return digits.length === 12 && digits.startsWith("971");
}

/**
 * Format phone number for display/send per country (with + and spaces/dashes).
 * @param {string} phone - digits only (e.g. "971551548684")
 * @param {object} country - country from PhoneInput; has .dialCode, .countryCode
 * @returns {string} e.g. "+971 55 154 8684", "+91 98765 43210"
 */
export function formatPhoneForCountry(phone, country) {
    const digits = String(phone ?? "").replace(/\D/g, "");
    if (!digits.length) return "";
    const dialCode = (country && country.dialCode) ? String(country.dialCode).replace(/\D/g, "") : "";
    const hasDial = dialCode && digits.startsWith(dialCode);
    const national = hasDial ? digits.slice(dialCode.length) : digits;

    switch (dialCode) {
        case "971": // UAE: +971 XX XXX XXXX
            return national.length >= 9 ? `+971 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5, 9)}` : `+971 ${national}`;
        case "91": // India: +91 XXXXX-XXXXX
            return national.length >= 10 ? `+91 ${national.slice(0, 5)}-${national.slice(5, 10)}` : `+91 ${national}`;
        case "1": // US/Canada: +1 (XXX) XXX-XXXX
            return national.length >= 10 ? `+1 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6, 10)}` : `+1 ${national}`;
        case "44": // UK: +44 XXXX XXXXXX
            return national.length >= 10 ? `+44 ${national.slice(0, 4)} ${national.slice(4, 10)}` : `+44 ${national}`;
        case "966": // Saudi: +966 XX XXX XXXX
            return national.length >= 9 ? `+966 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5, 9)}` : `+966 ${national}`;
        case "965": // Kuwait: +965 XXXX XXXX
            return national.length >= 8 ? `+965 ${national.slice(0, 4)} ${national.slice(4, 8)}` : `+965 ${national}`;
        case "974": // Qatar: +974 XXXX XXXX
            return national.length >= 8 ? `+974 ${national.slice(0, 4)} ${national.slice(4, 8)}` : `+974 ${national}`;
        case "973": // Bahrain: +973 XXXX XXXX
            return national.length >= 8 ? `+973 ${national.slice(0, 4)} ${national.slice(4, 8)}` : `+973 ${national}`;
        case "968": // Oman: +968 XXXX XXXX
            return national.length >= 8 ? `+968 ${national.slice(0, 4)} ${national.slice(4, 8)}` : `+968 ${national}`;
        case "49": // Germany: +49 XXX XXXXXXX
            return national.length >= 10 ? `+49 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}` : `+49 ${national}`;
        case "33": // France: +33 X XX XX XX XX
            return national.length >= 9 ? `+33 ${national.slice(0, 1)} ${national.slice(1, 3)} ${national.slice(3, 5)} ${national.slice(5, 7)} ${national.slice(7, 9)}` : `+33 ${national}`;
        case "81": // Japan: +81 XX XXXX XXXX
            return national.length >= 10 ? `+81 ${national.slice(0, 2)} ${national.slice(2, 6)} ${national.slice(6, 10)}` : `+81 ${national}`;
        case "86": // China: +86 XXX XXXX XXXX
            return national.length >= 11 ? `+86 ${national.slice(0, 3)} ${national.slice(3, 7)} ${national.slice(7, 11)}` : `+86 ${national}`;
        case "61": // Australia: +61 XXX XXX XXX
            return national.length >= 9 ? `+61 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6, 9)}` : `+61 ${national}`;
        case "234": // Nigeria: +234 XXX XXX XXXX
            return national.length >= 10 ? `+234 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6, 10)}` : `+234 ${national}`;
        case "20": // Egypt: +20 XXX XXX XXXX
            return national.length >= 9 ? `+20 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6, 9)}` : `+20 ${national}`;
        case "27": // South Africa: +27 XX XXX XXXX
            return national.length >= 9 ? `+27 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5, 9)}` : `+27 ${national}`;
        default:
            return dialCode ? `+${dialCode} ${national}` : `+${digits}`;
    }
}
