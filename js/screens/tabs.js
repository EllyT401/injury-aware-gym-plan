// The four main tabs. In Stage 1 only Settings is fully working; Today, Plan
// and Progress show a summary or a "coming soon" note.

import { esc, $, isInstalled } from "../util.js";
import { getState, update, exportJSON, importJSON, reset, storageIsWorking } from "../store.js";
import { alertBox } from "../ui.js";
import { renderPrefs, bindPrefs } from "./prefs.js";

export const TABS = [
  ["today", "Today", "📋"],
  ["plan", "Plan", "🗓️"],
  ["progress", "Progress", "📈"],
  ["settings", "Settings", "⚙️"],
];

const USER_TYPE_LABEL = {
  none: "No plan yet (the app will build one)",
  hasplan: "I have a plan already",
  selfdx: "Self-diagnosing (extra cautious mode)",
};

export function renderTab(tab, container, ctx) {
  ({ today, plan, progress, settings })[tab](container, ctx);
}

function restrictionSummary(ctx) {
  const s = getState();
  const tags = [...new Set(s.restrictions.map((r) => r.tag))];
  const chips = tags.length
    ? `<div class="chips">${tags.map((t) => `<span class="chip">${esc(ctx.data.tagLabels[t] || t)}</span>`).join("")}</div>`
    : `<p class="muted">No movement restrictions saved.</p>`;
  return chips;
}

function today(container, ctx) {
  const s = getState();
  const profile = s.profiles.find((p) => p.id === s.activeProfileId) || s.profiles[0];
  container.innerHTML = `
    <div class="stack">
      <h1 tabindex="-1">Today</h1>
      ${alertBox("ok", "✅", "<p><strong>Setup is complete.</strong> Your answers are saved on this phone.</p>")}
      <div class="card stack">
        <h2>What the app will avoid</h2>
        ${restrictionSummary(ctx)}
        ${s.notes.unmapped.length ? `<p class="muted small">Kept as notes: ${s.notes.unmapped.map(esc).join("; ")}</p>` : ""}
      </div>
      <div class="card">
        <p style="margin:0"><strong>Equipment:</strong> ${esc(profile.name)}</p>
        <p style="margin:0"><strong>Mode:</strong> ${esc(USER_TYPE_LABEL[s.userType] || "")}</p>
      </div>
      ${alertBox("info", "🚧", "<p>Today's session, with exercises, logging and pain checks, arrives in a later stage.</p>")}
    </div>`;
}

function plan(container) {
  container.innerHTML = `
    <div class="stack">
      <h1 tabindex="-1">Plan</h1>
      ${alertBox("info", "🚧", "<p>Your weekly plan will appear here in a later stage.</p>")}
    </div>`;
}

function progress(container) {
  container.innerHTML = `
    <div class="stack">
      <h1 tabindex="-1">Progress</h1>
      ${alertBox("info", "🚧", "<p>Charts, weekly summaries and your notes for the physio will appear here in a later stage.</p>")}
    </div>`;
}

function settings(container, ctx) {
  const s = getState();
  const installTip = !isInstalled()
    ? alertBox(
        "info",
        "💡",
        `<p><strong>Tip: add this app to your home screen.</strong> Phones can clear data from websites that aren't installed. Installing it, and exporting a backup now and then, keeps your log safe.</p>`
      )
    : "";
  const storageWarning = !storageIsWorking()
    ? alertBox("warn", "⚠️", "<p><strong>This browser isn't saving data.</strong> Your answers will be lost when you close the page. Try turning off private browsing.</p>")
    : "";

  container.innerHTML = `
    <div class="stack">
      <h1 tabindex="-1">Settings</h1>
      ${storageWarning}
      <div class="card stack" id="prefs">
        <h2>Preferences</h2>
        ${renderPrefs(s.prefs)}
      </div>

      <div class="card stack">
        <h2>Your setup</h2>
        <p class="muted">Mode: ${esc(USER_TYPE_LABEL[s.userType] || "")}</p>
        ${restrictionSummary(ctx)}
        <button class="btn btn-block" id="redo">Change my injury, restrictions or equipment</button>
      </div>

      <div class="card stack">
        <h2>Your data</h2>
        <p class="muted">Everything is stored on this phone only.</p>
        ${installTip}
        <button class="btn btn-block" id="export">Export a backup</button>
        <div>
          <label class="field-label" for="restore">Restore from a backup</label>
          <input type="file" id="restore" accept="application/json,.json">
        </div>
        <div class="field-error" id="restore-msg" role="alert"></div>
        <button class="btn btn-danger btn-block" id="reset">Delete all my data</button>
      </div>
    </div>`;

  bindPrefs($(container, "#prefs"));

  $(container, "#redo").addEventListener("click", () => {
    update((st) => {
      st.setup.complete = false;
      st.setup.step = "usertype";
    });
    ctx.render();
  });

  $(container, "#export").addEventListener("click", () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gym-plan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $(container, "#restore").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importJSON(String(reader.result));
      if (result.ok) ctx.render();
      else $(container, "#restore-msg").textContent = result.error;
    };
    reader.readAsText(file);
  });

  $(container, "#reset").addEventListener("click", () => {
    if (window.confirm("Delete everything saved in this app on this phone? This can't be undone.")) {
      reset();
      ctx.render();
    }
  });
}
