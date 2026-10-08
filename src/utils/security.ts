/**
 * Security and privacy utility functions for CyberShield AI.
 * Ensures safe handling, PII redaction, sanitization, and pre-transmission credential stripping.
 */

// Maximum input limits to prevent DoS / memory exhaustion
export const MAX_MESSAGE_LENGTH = 5000;
export const MAX_URL_LENGTH = 2048;

/**
 * Strips dangerous control characters and trims input.
 */
export function sanitizeInput(input: string, maxLength: number): string {
  if (typeof input !== 'string') return '';
  // Remove null bytes and non-printable control characters except newline and tab
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.slice(0, maxLength).trim();
}

/**
 * Fast deterministic string hash for in-memory caching.
 */
export function fastSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Pre-transmission credential scrubber:
 * NEVER sends real passwords, active OTPs, or financial secrets to AI services or backend.
 * Replaces live credentials with generic security tokens so analysis logic works
 * without exposing real secrets.
 */
export function stripSensitiveCredentialsBeforeTransmission(rawText: string): string {
  if (!rawText) return '';

  let cleaned = rawText;

  // Mask sensitive credit cards
  cleaned = cleaned.replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[CARD_NUMBER_MASKED]');

  // Mask OTP codes (e.g., "code is 123456", "OTP: 981245")
  cleaned = cleaned.replace(
    /(?:otp|code|pin|verification code|one-time code)[:\s=]+([0-9]{4,8})\b/gi,
    (match, p1) => match.replace(p1, '[OTP_CODE_MASKED]')
  );

  // Mask passwords (e.g., "password: mySecret123!", "pass is Admin@123")
  cleaned = cleaned.replace(
    /(?:password|passwd|pass|secret)[:\s=]+([^\s,;.]{4,30})\b/gi,
    (match, p1) => match.replace(p1, '[PASSWORD_MASKED]')
  );

  // Mask standalone SSN or Aadhaar or 9-digit / 12-digit national IDs
  cleaned = cleaned.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[ID_NUMBER_MASKED]');

  return cleaned;
}

/**
 * Redacts potential PII (Personally Identifiable Information) before storing into session history:
 * - Phone numbers
 * - Email addresses
 * - Credit card sequences
 * - 4-8 digit OTP verification codes
 * - Passwords mentioned in text
 */
export function redactSensitiveData(text: string): string {
  if (!text) return '';

  let sanitized = text;

  // Mask email addresses
  sanitized = sanitized.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    '[EMAIL_REDACTED]'
  );

  // Mask credit card numbers (13-16 digits with optional spaces or dashes)
  sanitized = sanitized.replace(
    /\b(?:\d{4}[ -]?){3}\d{4}\b/g,
    '[CARD_REDACTED]'
  );

  // Mask phone numbers (US and international formats)
  sanitized = sanitized.replace(
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    '[PHONE_REDACTED]'
  );

  // Mask potential standalone OTPs or security codes
  sanitized = sanitized.replace(
    /(?:code|otp|pin|password|token)[:\s]+([0-9a-zA-Z]{4,8})\b/gi,
    (match) => match.replace(/[0-9a-zA-Z]{4,8}$/, '[CODE_REDACTED]')
  );

  return sanitized;
}

/**
 * Creates a safe, truncated snippet for history display.
 */
export function createSafeSnippet(text: string, maxChars: number = 80): string {
  const redacted = redactSensitiveData(text);
  if (redacted.length <= maxChars) {
    return redacted;
  }
  return redacted.slice(0, maxChars) + '...';
}
