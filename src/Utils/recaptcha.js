/**
 * reCAPTCHA v3 utility for City Doctor landing page.
 * Runs once on landing (no form) to get a token; optional backend verification.
 *
 * v3 is INVISIBLE: no checkbox, no challenge. You may see a small "protected by reCAPTCHA"
 * badge at the bottom-right of the page (added by Google). In dev, check the console for
 * "[recaptcha] Landing OK" to confirm it ran.
 *
 * Setup: Add VITE_RECAPTCHA_SITE_KEY to .env (see RECAPTCHA_SETUP_GUIDE.md).
 */

const RECAPTCHA_SCRIPT_URL = 'https://www.google.com/recaptcha/api.js';
const DEFAULT_ACTION = 'landing';

// Fallback site key (prefer VITE_RECAPTCHA_SITE_KEY in .env for different environments)
const RECAPTCHA_SITE_KEY_FALLBACK = '6Ld04GUsAAAAAPJG8Q_PE6fwu6z_iuyNiFbMQ8jj';

/**
 * Get the reCAPTCHA site key (env or fallback). Secret key is never used in frontend.
 * @returns {string}
 */
export function getRecaptchaSiteKey() {
  const fromEnv = typeof import.meta !== 'undefined' && import.meta.env?.VITE_RECAPTCHA_SITE_KEY;
  return (fromEnv && fromEnv.trim()) ? fromEnv.trim() : RECAPTCHA_SITE_KEY_FALLBACK;
}

/**
 * Load the reCAPTCHA v3 script once. Uses site key in the URL so grecaptcha is ready.
 * @param {string} [siteKey] - Optional; defaults to getRecaptchaSiteKey()
 * @returns {Promise<typeof window.grecaptcha>}
 */
export function loadRecaptchaScript(siteKey = getRecaptchaSiteKey()) {
  if (!siteKey) {
    return Promise.reject(new Error('reCAPTCHA site key not configured (VITE_RECAPTCHA_SITE_KEY)'));
  }

  const waitReady = (grecaptcha) => {
    if (typeof grecaptcha?.ready !== 'function') {
      return Promise.resolve(grecaptcha);
    }
    return new Promise((resolve) => {
      grecaptcha.ready(() => resolve(grecaptcha));
    });
  };

  if (typeof window !== 'undefined' && window.grecaptcha) {
    return waitReady(window.grecaptcha);
  }

  return new Promise((resolve, reject) => {
    const id = 'recaptcha-v3-script';
    if (document.getElementById(id)) {
      const check = () => {
        if (window.grecaptcha) {
          waitReady(window.grecaptcha).then(resolve).catch(reject);
        } else {
          setTimeout(check, 50);
        }
      };
      check();
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = `${RECAPTCHA_SCRIPT_URL}?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.onload = () => {
      if (!window.grecaptcha) {
        reject(new Error('reCAPTCHA script loaded but grecaptcha not available'));
        return;
      }
      waitReady(window.grecaptcha).then(resolve).catch(reject);
    };
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));
    document.head.appendChild(script);
  });
}

/**
 * Execute reCAPTCHA v3 for an action and return the token.
 * @param {string} [action] - Action name for analytics (e.g. 'landing', 'submit'); default 'landing'
 * @param {string} [siteKey] - Optional; defaults to getRecaptchaSiteKey()
 * @returns {Promise<string>} - Token to send to your backend for verification
 */
export async function executeRecaptcha(action = DEFAULT_ACTION, siteKey = getRecaptchaSiteKey()) {
  if (!siteKey) {
    console.warn('[recaptcha] Site key not set; skipping execute.');
    return '';
  }

  const grecaptcha = await loadRecaptchaScript(siteKey);
  const token = await grecaptcha.execute(siteKey, { action });
  return token;
}

/**
 * Run reCAPTCHA once on landing. Call this when the app/landing page mounts.
 * Does not block render; token can be logged or sent to your backend (e.g. with next WhatsApp click).
 * @param {Object} [options]
 * @param {string} [options.action] - Action name (default: 'landing')
 * @param {(token: string) => void} [options.onToken] - Callback with token (e.g. send to Apps Script)
 */
export function initRecaptchaOnLanding(options = {}) {
  const { action = DEFAULT_ACTION, onToken } = options;
  const siteKey = getRecaptchaSiteKey();

  if (!siteKey) {
    return;
  }

  loadRecaptchaScript(siteKey)
    .then((grecaptcha) => grecaptcha.execute(siteKey, { action }))
    .then((token) => {
      if (import.meta.env?.DEV && token) {
        console.log('[recaptcha] Landing OK – token received (first 20 chars):', token.slice(0, 20) + '…');
      }
      if (typeof onToken === 'function') {
        onToken(token);
      }
    })
    .catch((err) => {
      console.warn('[recaptcha] Landing run failed:', err?.message || err);
    });
}
