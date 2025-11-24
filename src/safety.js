// src/safety.js

// Very lightweight, conservative keyword check.
// You can expand this list over time. Keep it simple to avoid false negatives.
const CRISIS_PATTERNS = [
  /kill myself|suicide|end my life|want to die|wish i were dead/i,
  /self[-\s]?harm|hurt myself on purpose|cutting|overdose/i,
  /i can’t go on|no reason to live|life isn’t worth/i,
  /i’m going to (kill|hurt) myself/i
];

// US resources (Hawaiʻi included). You can add more regions if needed.
export function getCrisisMessage() {
  return [
    "🚨 I’m here for you. It sounds like you might be going through a crisis.",
    "Right now, a guided meditation isn’t the safest support. Please consider reaching out to a trained professional:",
    "",
    "• **988 Suicide & Crisis Lifeline (U.S.)** — call or text **988**, or chat at 988lifeline.org",
    "• If you’re in immediate danger, call **911**.",
    "",
    "If you’re outside the U.S., please contact your local emergency number or a local crisis organization.",
    "",
    "You matter. You are not alone. Reaching out is a strong and courageous step. 💛"
  ].join("\n");
}

export function detectCrisis(text = "") {
  if (!text) return false;
  return CRISIS_PATTERNS.some((re) => re.test(text));
}
