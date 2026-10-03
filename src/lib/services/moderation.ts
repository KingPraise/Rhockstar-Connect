/**
 * Rhockstar Automated Content Moderation Service
 * Inspects user posts, comments, and advert content for prohibited material.
 */

const SPAM_KEYWORDS = [
  "get rich quick",
  "crypto double",
  "whatsapp group join link",
  "100% guaranteed profit",
  "free money click here",
];

export interface ModerationResult {
  isSafe: boolean;
  flaggedReason?: string;
}

export function checkContentSafety(text: string): ModerationResult {
  if (!text || text.trim().length === 0) return { isSafe: true };

  const lowerText = text.toLowerCase();

  for (const keyword of SPAM_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return {
        isSafe: false,
        flaggedReason: `Content contains prohibited spam phrase: "${keyword}"`,
      };
    }
  }

  return { isSafe: true };
}
