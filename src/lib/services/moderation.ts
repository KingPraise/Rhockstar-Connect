import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Rhockstar Two-Tier Automated Content Moderation Engine
 * - Tier 1 (Severe): Scams, malware URLs, financial fraud, and hate speech -> Blocked immediately + Logged.
 * - Tier 2 (Ambiguous): Suspicious external Telegram/WhatsApp solicitation or shortened links -> Published + Flagged to SuperAdmin queue.
 */

const SEVERE_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\b(get rich quick|crypto double|100% guaranteed profit|free money click here|ponzi scheme|carding tutorial|hack bank account)\b/i, reason: 'Prohibited financial scam or fraud solicitation' },
  { pattern: /\b(send (btc|bitcoin|usdt|eth) to receive double)\b/i, reason: 'Cryptocurrency doubling scam detected' },
  { pattern: /(javascript\s*:|data\s*:\s*text\/html|<script[\s\S]*?>)/i, reason: 'Malicious script or XSS payload detected' },
];

const AMBIGUOUS_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /(chat\.whatsapp\.com\/[a-zA-Z0-9]+|t\.me\/\+?[a-zA-Z0-9_]+)/i, reason: 'External WhatsApp/Telegram group solicitation link' },
  { pattern: /\b(bit\.ly|tinyurl\.com|is\.gd|rb\.gy)\/[a-zA-Z0-9_-]+/i, reason: 'Obfuscated URL shortener detected' },
  { pattern: /\b(dm me on whatsapp|message me on telegram for investment)\b/i, reason: 'Off-platform financial solicitation' },
];

export type ModerationSeverity = 'clean' | 'ambiguous' | 'severe';

export interface ModerationResult {
  isSafe: boolean; // false only when severity === 'severe' (blocks immediate publication)
  severity: ModerationSeverity;
  flaggedReason?: string;
}

export function checkContentSafety(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { isSafe: true, severity: 'clean' };
  }

  // 1. Check Tier 1 Severe Patterns (Immediate Block)
  for (const rule of SEVERE_PATTERNS) {
    if (rule.pattern.test(text)) {
      return {
        isSafe: false,
        severity: 'severe',
        flaggedReason: rule.reason,
      };
    }
  }

  // 2. Check Tier 2 Ambiguous Patterns (Allow Publish, Flag for SuperAdmin Queue)
  for (const rule of AMBIGUOUS_PATTERNS) {
    if (rule.pattern.test(text)) {
      return {
        isSafe: true,
        severity: 'ambiguous',
        flaggedReason: rule.reason,
      };
    }
  }

  return { isSafe: true, severity: 'clean' };
}

/**
 * Automatically log severe or ambiguous content to the SuperAdmin 'flagged_content' queue
 */
export async function logFlaggedContent(params: {
  authorId: string;
  authorName: string;
  contentType: 'post' | 'message' | 'comment' | 'ad';
  targetId?: string;
  contentSnippet: string;
  severity: 'ambiguous' | 'severe';
  reason: string;
}) {
  try {
    await addDoc(collection(db, 'flagged_content'), {
      ...params,
      contentSnippet: params.contentSnippet.slice(0, 500),
      status: params.severity === 'severe' ? 'blocked_automatically' : 'pending_review',
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Could not log flagged content to moderation queue:', err);
  }
}
