// Turns the user's own words into movement tags (see data/tags.json).
//
// Anything we can confidently map is returned in `mapped`.
// Anything we can't is returned in `unmapped` so the user can confirm it
// themselves. We never guess.

import { normalise, compilePhrase } from "./safety/redflags.js";

export function compileTags(tagsData) {
  return tagsData.tags.map((t) => ({
    id: t.id,
    label: t.label,
    matchers: t.keywords.map(compilePhrase),
  }));
}

/** Split free text into short statements (one idea per line, comma, "and"...). */
export function splitClauses(text) {
  return String(text ?? "")
    .split(/[\n;.,]+|\s+(?:but|and)\s+/i)
    .map((c) => c.replace(/^[\s\-•*\d)]+/, "").trim())
    .filter((c) => c.length > 2);
}

/**
 * Map free text to tags.
 * Returns {
 *   mapped:   [{ clause, tags: ["knee_bending", ...] }],
 *   unmapped: ["clause we could not map", ...]
 * }
 */
export function mapText(text, compiledTags) {
  const mapped = [];
  const unmapped = [];
  for (const clause of splitClauses(text)) {
    const n = normalise(clause);
    const tags = compiledTags
      .filter((tag) => tag.matchers.some(({ re }) => re.test(n)))
      .map((tag) => tag.id);
    if (tags.length) mapped.push({ clause, tags });
    else unmapped.push(clause);
  }
  return { mapped, unmapped };
}
