// The preferences form. Used both in setup and in Settings.

import { update } from "../store.js";
import { applyPrefs } from "../util.js";
import { radioGroup } from "../ui.js";

export function renderPrefs(prefs) {
  return `
    <div class="stack">
      ${radioGroup("units", "Weight units", [["kg", "Kilograms (kg)"], ["lb", "Pounds (lb)"]], prefs.units)}
      ${radioGroup("theme", "Appearance", [["system", "Match my phone"], ["light", "Light"], ["dark", "Dark"]], prefs.theme)}
      ${radioGroup("textSize", "Text size", [["small", "Small"], ["medium", "Medium"], ["large", "Large"]], prefs.textSize)}
      ${radioGroup("planView", "Plan view", [["day", "One day at a time"], ["week", "Whole week"], ["checklist", "Simple checklist"]], prefs.planView)}
      ${radioGroup(
        "autoAdjust",
        "When my plan needs changing (for example after a flare-up)",
        [
          ["ask", "Ask me before changing my plan", "Recommended"],
          ["auto", "Adjust automatically"],
        ],
        prefs.autoAdjust ? "auto" : "ask"
      )}
      <p class="hint">Whichever you choose, serious symptoms or severe flare-ups always pause your plan and recommend seeing a professional. No setting can change that.</p>
    </div>`;
}

/** Save each change straight away. */
export function bindPrefs(container) {
  container.addEventListener("change", (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || input.type !== "radio") return;
    update((s) => {
      if (input.name === "autoAdjust") s.prefs.autoAdjust = input.value === "auto";
      else if (input.name in s.prefs) s.prefs[input.name] = input.value;
      applyPrefs(s.prefs);
    });
  });
}
