// The urgent-symptom checker.
//
// How it works, in plain terms:
//  1. The text is made lower case, with punctuation and apostrophes removed.
//  2. It is compared against the phrase lists in data/redflags.json.
//  3. Any match gives a result of "emergency" or "urgent". No match is "none".
//
// This file has no browser-only code, so the same logic runs in the app,
// on the test page, and in the command-line test runner.

/** Make text easy to compare: lower case, no apostrophes, single spaces. */
export function normalise(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[‘’`']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Turn a phrase like "numb*" or "pins and needles" into a matcher.
 * A * on the end of a word means "any ending".
 */
export function compilePhrase(phrase) {
  const tokens = String(phrase)
    .toLowerCase()
    .replace(/[‘’`']/g, "")
    .split(/[^a-z0-9*]+/)
    .filter(Boolean);
  const body = tokens
    .map((t) => {
      const star = t.endsWith("*");
      const base = t.replace(/\*/g, "");
      return base + (star ? "[a-z0-9]*" : "");
    })
    .join("\\s+");
  return { phrase, re: new RegExp("(?:^|\\s)(" + body + ")(?=\\s|$)") };
}

/** Prepare the three phrase lists once, so checking is quick. */
export function compileRules(rules) {
  const build = (list) => (list || []).map(compilePhrase);
  return {
    emergency: build(rules.emergency),
    urgent: build(rules.urgent),
    strict: build(rules.strict),
  };
}

function findMatches(normalisedText, list, level) {
  const found = [];
  for (const { phrase, re } of list) {
    const m = re.exec(normalisedText);
    if (m) found.push({ level, phrase, text: m[1] });
  }
  return found;
}

/**
 * Check a piece of text.
 *   options.strict = true for users who chose "I'm self-diagnosing".
 * Returns { level: "none" | "urgent" | "emergency", matches: [...], strictOnly }
 *   strictOnly is true when ONLY the extra strict list matched.
 */
export function checkText(text, compiled, options = {}) {
  const n = normalise(text);
  if (!n) return { level: "none", matches: [], strictOnly: false };

  const emergency = findMatches(n, compiled.emergency, "emergency");
  const urgent = findMatches(n, compiled.urgent, "urgent");
  const strict = options.strict ? findMatches(n, compiled.strict, "urgent") : [];

  const matches = [...emergency, ...urgent, ...strict];
  let level = "none";
  if (emergency.length) level = "emergency";
  else if (urgent.length || strict.length) level = "urgent";

  return {
    level,
    matches,
    strictOnly: level === "urgent" && urgent.length === 0 && strict.length > 0,
  };
}

/** Check several named pieces of text; returns the most serious result. */
export function checkAll(texts, compiled, options = {}) {
  let worst = { level: "none", matches: [], strictOnly: false };
  const rank = { none: 0, urgent: 1, emergency: 2 };
  for (const t of texts) {
    const r = checkText(t, compiled, options);
    if (rank[r.level] > rank[worst.level]) worst = r;
  }
  return worst;
}
