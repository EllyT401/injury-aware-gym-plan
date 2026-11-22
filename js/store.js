// Saves everything on the user's phone (browser localStorage). No server.
// If the browser blocks storage, the app still works until it is closed,
// and Settings shows a warning.

const KEY = "igp.v1";

function defaults() {
  return {
    version: 1,
    disclaimer: { acceptedAt: null, version: 1 },
    userType: null, // "none" | "hasplan" | "selfdx"
    setup: { step: "disclaimer", complete: false, draft: {} },
    injuries: [], // ids from the injury pick list
    pickedRestrictions: [], // ids from the restriction pick list
    restrictions: [], // final list: [{ tag, source, evidence }]
    notes: { physio: "", planText: "", selfDx: "", unmapped: [] },
    profiles: [{ id: "p1", name: "My setup", equipment: ["bodyweight"] }],
    activeProfileId: "p1",
    prefs: {
      units: "kg", // "kg" | "lb"
      theme: "system", // "system" | "light" | "dark"
      textSize: "medium", // "small" | "medium" | "large"
      planView: "day", // "day" | "week" | "checklist"
      autoAdjust: false, // false = "Ask me before changing my plan" (default)
    },
    pause: { active: false },
    safetyLog: [], // what triggered a pause (matched words only, newest last)
  };
}

let state = null;
let storageWorks = true;
const listeners = new Set();

/** Fill in any missing fields so newer app versions can read older saved data. */
function merge(base, saved) {
  if (Array.isArray(base) || typeof base !== "object" || base === null) {
    return saved === undefined ? base : saved;
  }
  const out = { ...base };
  if (saved && typeof saved === "object") {
    for (const k of Object.keys(saved)) {
      out[k] = k in base ? merge(base[k], saved[k]) : saved[k];
    }
  }
  return out;
}

export function load() {
  let saved = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) saved = JSON.parse(raw);
  } catch (e) {
    storageWorks = false;
  }
  state = merge(defaults(), saved);
  // Probe that writing works
  try {
    localStorage.setItem(KEY + ".probe", "1");
    localStorage.removeItem(KEY + ".probe");
  } catch (e) {
    storageWorks = false;
  }
  return state;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    storageWorks = false;
  }
}

export function getState() {
  if (!state) load();
  return state;
}

/** Change the saved data: update((s) => { s.userType = "none"; }) */
export function update(mutator) {
  mutator(getState());
  save();
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function storageIsWorking() {
  return storageWorks;
}

/** Everything as text, for the "Export backup" button. */
export function exportJSON() {
  return JSON.stringify({ app: "injury-aware-gym-plan", exportedAt: new Date().toISOString(), data: getState() }, null, 2);
}

/** Restore from a backup file. Returns { ok, error }. */
export function importJSON(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || parsed.app !== "injury-aware-gym-plan" || typeof parsed.data !== "object") {
      return { ok: false, error: "This file doesn't look like a backup from this app." };
    }
    state = merge(defaults(), parsed.data);
    save();
    listeners.forEach((fn) => fn(state));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: "That file couldn't be read." };
  }
}

/** Wipe everything and start again. */
export function reset() {
  state = defaults();
  save();
  listeners.forEach((fn) => fn(state));
}
