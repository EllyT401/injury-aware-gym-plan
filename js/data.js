// Loads the editable data files (red flags, tags, injury lists).
//
// SAFETY: if the red-flag rules can't be loaded, the app must NOT carry on
// without them. loadData() throws, and app.js shows an error screen instead.

import { compileRules } from "./safety/redflags.js";
import { compileTags } from "./tags.js";

let cached = null;

async function getJSON(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  return res.json();
}

export async function loadData() {
  if (cached) return cached;
  const [redflags, tags, injuries] = await Promise.all([
    getJSON("./data/redflags.json"),
    getJSON("./data/tags.json"),
    getJSON("./data/injuries.json"),
  ]);
  cached = {
    rules: compileRules(redflags),
    tags: compileTags(tags),
    tagLabels: Object.fromEntries(tags.tags.map((t) => [t.id, t.label])),
    injuries: injuries.injuries,
    restrictions: injuries.restrictions,
  };
  return cached;
}
