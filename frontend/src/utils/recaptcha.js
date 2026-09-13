export const RECAPTCHA_SITE_KEY = "6LdhfJEtAAAAAIh5EJKDiU0K_RHdHj5wVQkuqOhb";

/**
 * Execute Google reCAPTCHA Enterprise for a given user action (e.g., 'LOGIN', 'REGISTER').
 * @param {string} action - Action identifier for Google reCAPTCHA Enterprise risk analysis.
 * @returns {Promise<string|null>} reCAPTCHA enterprise token or null if unavailable.
 */
export const executeRecaptcha = (action = "LOGIN") => {
  return new Promise((resolve) => {
    if (
      typeof window === "undefined" ||
      !window.grecaptcha ||
      !window.grecaptcha.enterprise
    ) {
      console.warn("reCAPTCHA Enterprise script not available. Proceeding without token.");
      return resolve(null);
    }

    try {
      window.grecaptcha.enterprise.ready(async () => {
        try {
          const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, {
            action
          });
          resolve(token);
        } catch (err) {
          console.warn("reCAPTCHA Enterprise execution warning:", err.message);
          resolve(null);
        }
      });
    } catch (err) {
      console.warn("reCAPTCHA Enterprise ready warning:", err.message);
      resolve(null);
    }
  });
};

export default executeRecaptcha;
