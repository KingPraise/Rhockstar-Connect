/**
 * Rhockstar Connect Input Sanitization & Anti-XSS Utility
 */

/**
 * Strips script tags, HTML tags, and dangerous executable syntax from user input strings.
 */
export function sanitizeText(input: unknown, maxLength = 5000): string {
  if (typeof input !== 'string') return '';

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Strip HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Disallow javascript: pseudoprotocol
    .replace(/javascript\s*:/gi, '')
    // Trim and enforce length bound
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes URLs ensuring they only use safe protocols (http, https, mailto, tel)
 */
export function sanitizeUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Allow relative paths
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Allow only safe external protocols
  const safeProtocolRegex = /^(https?|mailto|tel):/i;
  if (safeProtocolRegex.test(trimmed)) {
    return trimmed;
  }

  return '';
}
