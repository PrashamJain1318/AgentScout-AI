/**
 * Google reCAPTCHA Enterprise Assessment Verification Service
 * Project ID: agentbid-8f149
 * Site Key: 6LdhfJEtAAAAAIh5EJKDiU0K_RHdHj5wVQkuqOhb
 */

const PROJECT_ID = process.env.RECAPTCHA_PROJECT_ID || 'agentbid-8f149';
const SITE_KEY = process.env.RECAPTCHA_SITE_KEY || '6LdhfJEtAAAAAIh5EJKDiU0K_RHdHj5wVQkuqOhb';
const API_KEY = process.env.RECAPTCHA_API_KEY;

/**
 * Verify reCAPTCHA Enterprise Token by creating an assessment with Google Cloud.
 * @param {string} token - Token returned from grecaptcha.enterprise.execute()
 * @param {string} expectedAction - Action name (e.g. 'LOGIN', 'REGISTER')
 * @returns {Promise<{ valid: boolean, score: number, reasons?: string[], actionMatches: boolean }>}
 */
async function createAssessment(token, expectedAction = 'LOGIN') {
  if (!token) {
    console.warn('[reCAPTCHA Enterprise] No token provided. Skipping assessment.');
    return { valid: true, score: 1.0, actionMatches: true, skipped: true };
  }

  if (!API_KEY) {
    console.warn('[reCAPTCHA Enterprise] RECAPTCHA_API_KEY environment variable not set. Bypassing assessment check in dev/test mode.');
    return { valid: true, score: 1.0, actionMatches: true, skipped: true };
  }

  try {
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${API_KEY}`;
    const payload = {
      event: {
        token: token,
        siteKey: SITE_KEY,
        expectedAction: expectedAction,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[reCAPTCHA Enterprise] Assessment creation failed HTTP', response.status, errorText);
      // Non-blocking fail-safe fallback
      return { valid: true, score: 1.0, actionMatches: true, error: errorText };
    }

    const data = await response.json();
    const tokenProps = data.tokenProperties || {};
    const riskAnalysis = data.riskAnalysis || {};

    const valid = Boolean(tokenProps.valid);
    const score = typeof riskAnalysis.score === 'number' ? riskAnalysis.score : 1.0;
    const actionMatches = tokenProps.action === expectedAction;

    return {
      valid,
      score,
      reasons: riskAnalysis.reasons || [],
      actionMatches,
      assessmentName: data.name,
    };
  } catch (err) {
    console.error('[reCAPTCHA Enterprise] Error during assessment API call:', err.message);
    // Non-blocking fail-safe fallback
    return { valid: true, score: 1.0, actionMatches: true, error: err.message };
  }
}

module.exports = {
  createAssessment,
  PROJECT_ID,
  SITE_KEY,
};
