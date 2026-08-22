/**
 * Safe External URL Validator and Normalizer for AgentScout AI.
 */

/**
 * Validates if a string is a safe, resolvable HTTP/HTTPS external URL.
 * Rejects javascript:, data:, file:, mailto:, null, undefined, and malformed strings.
 * @param {string} value - Raw URL string
 * @returns {boolean} True if valid external HTTP/HTTPS URL
 */
export function isValidExternalUrl(value) {
  if (!value || typeof value !== "string") {
    return false;
  }

  let trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  // Reject dangerous pseudo-protocols explicitly
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("mailto:")
  ) {
    return false;
  }

  // Auto-prepend https:// if URL starts with www. or domain format without scheme
  if (!/^https?:\/\//i.test(trimmed)) {
    if (trimmed.startsWith("www.") || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    } else {
      return false;
    }
  }

  try {
    const parsed = new URL(trimmed);
    
    // Enforce HTTP or HTTPS protocol only
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    // Hostname must be non-empty
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Returns clean normalized URL or empty string if invalid.
 * @param {string} value
 * @returns {string}
 */
export function getCleanExternalUrl(value) {
  if (!value || typeof value !== "string") return "";
  let trimmed = value.trim();

  if (!/^https?:\/\//i.test(trimmed)) {
    if (trimmed.startsWith("www.") || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }
  }

  return isValidExternalUrl(trimmed) ? trimmed : "";
}
