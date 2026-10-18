"use client";

const SOUND_PREF_KEY = 'rhockstar_sound_enabled';

/**
 * Returns whether in-app notification sound cues are enabled (Default: true)
 */
export function isNotificationSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(SOUND_PREF_KEY);
  return stored === null ? true : stored === 'true';
}

/**
 * Updates user preference for in-app notification sound cues
 */
export function setNotificationSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_PREF_KEY, enabled ? 'true' : 'false');
}

/**
 * Synthesizes a soft, modern two-tone harmonic chime (C5 -> G5 sine wave)
 * Uses native Web Audio API — 0 KB asset download and zero network latency.
 */
export function playNotificationChime(forcePlay = false): void {
  if (typeof window === 'undefined') return;
  if (!forcePlay && !isNotificationSoundEnabled()) return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Note 1: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);

    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.26);

    // Note 2: G5 (783.99 Hz) harmonic fifth
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.11);

    gain2.gain.setValueAtTime(0.0001, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.16, now + 0.13);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.11);
    osc2.stop(now + 0.50);

    // Close AudioContext after chime completes to free hardware audio resources
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 600);
  } catch {
    // Browser autoplay policy may block audio if user hasn't interacted with the page yet
  }
}
