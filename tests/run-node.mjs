// Optional: run the same safety tests from the command line.
//   node tests/run-node.mjs
// (The browser page tests/safety-tests.html does the same thing.)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { compileRules, checkText } from "../js/safety/redflags.js";
import { compileTags, mapText } from "../js/tags.js";
import { safetyCases, tagCases } from "./cases.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const rules = compileRules(read("data/redflags.json"));
const tags = compileTags(read("data/tags.json"));

let failed = 0;

for (const c of safetyCases) {
  const r = checkText(c.text, rules, { strict: !!c.strict });
  const ok = r.level === c.level;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  [${c.strict ? "strict" : "normal"}] "${c.text}" -> ${r.level} (expected ${c.level})`);
}

for (const c of tagCases) {
  const r = mapText(c.text, tags);
  const got = [...new Set(r.mapped.flatMap((m) => m.tags))].sort();
  const want = [...c.tags].sort();
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  [tags] "${c.text}" -> [${got}] (expected [${want}])`);
}

console.log(failed ? `\n${failed} FAILED` : "\nAll passed");
process.exit(failed ? 1 : 0);
