// Pause rules. When something urgent is found, the plan is paused.
//
// IMPORTANT: nothing in Settings (including "Adjust automatically") is ever
// read here. A pause can only be lifted by the user confirming they have been
// checked by a professional, or that the symptom has fully gone.

import { update } from "../store.js";

/**
 * Pain thresholds (0-10 scale). These are the starting defaults from the
 * build brief and are kept in one place so they are easy to review.
 * Used from Stage 3 onwards (pain sliders) and Stage 5 (flare-ups).
 */
export const PAIN = {
  pauseAt: 7, // pain this high pauses the plan
  pauseAtSelfDx: 6, // self-diagnosing users get a lower threshold
  easeAt: 4, // 4 to (pauseAt - 1) suggests an easier version
  flareHighAt: 7, // a flare-up this bad pauses the plan
  calmAt: 3, // a "calm" session is at or below this pain
  calmSessionsNeeded: 3, // calm sessions in a row to end a flare-up
};

/** What should happen for a pain score? "ok" | "ease" | "pause" */
export function evaluatePain(score, { strict = false } = {}) {
  const pauseAt = strict ? PAIN.pauseAtSelfDx : PAIN.pauseAt;
  if (score >= pauseAt) return "pause";
  if (score >= PAIN.easeAt) return "ease";
  return "ok";
}

/** Pause the plan because of a red-flag result from checkText(). */
export function pauseFor(result, { source, strict }) {
  update((s) => {
    s.pause = {
      active: true,
      level: result.level, // "urgent" | "emergency"
      strict: !!strict,
      strictOnly: !!result.strictOnly,
      source, // where the text was typed, e.g. "injury details"
      phrases: [...new Set(result.matches.map((m) => m.text))],
      at: new Date().toISOString(),
    };
    s.safetyLog.push({
      at: s.pause.at,
      source,
      level: result.level,
      phrases: s.pause.phrases,
    });
    if (s.safetyLog.length > 50) s.safetyLog.shift();
  });
}

/** The user confirms they've been checked / the symptom has gone. */
export function resumeAfterConfirmation() {
  update((s) => {
    s.pause = { active: false, resumedAt: new Date().toISOString() };
  });
}
