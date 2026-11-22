// The pause screen: shown instead of the plan (or setup) when an urgent
// symptom has been found. It cannot be skipped by any setting.

import { esc, $ } from "../util.js";
import { getState } from "../store.js";
import { resumeAfterConfirmation } from "../safety/pause.js";
import { alertBox } from "../ui.js";

export function renderPause(container, ctx) {
  const s = getState();
  const p = s.pause;
  const emergency = p.level === "emergency";
  const what = s.setup.complete ? "Your plan is paused" : "Setup is paused";
  const noticed = (p.phrases || []).map((t) => `<span class="chip">${esc(t)}</span>`).join(" ");

  const heading = emergency ? "Stop and get urgent help" : what;
  const icon = emergency ? "🚨" : "⏸️";

  let body = "";
  if (emergency) {
    body += alertBox(
      "danger",
      "🚨",
      `<p><strong>If you have chest pain, trouble breathing, or feel faint, stop exercising now and call emergency services (000 in Australia).</strong></p>
       <p>Please don't train again until a doctor has checked you.</p>`
    );
  } else {
    body += alertBox(
      "warn",
      "⚠️",
      `<p><strong>Please see a physio or doctor before training.</strong></p>
       <p>What you wrote includes something that can be a sign of a problem that needs checking.
       This app can't tell what it means, so it has paused to be safe.</p>`
    );
  }

  body += `<div class="card"><p class="muted small" style="margin-bottom:8px">Words that triggered this pause (from ${esc(p.source || "what you typed")}):</p><div class="chips">${noticed}</div></div>`;

  if (p.strict) {
    body += alertBox(
      "info",
      "ℹ️",
      `<p><strong>General guidance only.</strong> You told us you're working out what's wrong yourself, so we're being extra careful. We can't diagnose anything.</p>
       <ul>
         <li>Rest the sore area and avoid anything that brings on the symptoms.</li>
         <li>Don't push through pain.</li>
         <li>Book a physio or doctor appointment and tell them what you've noticed.</li>
       </ul>`
    );
  } else {
    body += `<p>Take this to your physio or doctor. Your professional's advice is the authority, not this app.</p>`;
  }

  container.innerHTML = `
    <div class="stack">
      <div class="pause-title"><span class="alert-icon" aria-hidden="true">${icon}</span><h1 tabindex="-1" style="margin:0">${esc(heading)}</h1></div>
      ${body}
      <div class="card stack" id="resume-area">
        <h2>Ready to carry on?</h2>
        <p>Only continue once a professional has checked you, or the symptom has fully gone.
        ${s.setup.complete ? "" : "You'll go back to the step you were on and can reword what you wrote. If it still mentions a warning sign, the app will pause again."}</p>
        <button class="btn btn-block" id="show-resume">I'd like to carry on</button>
        <div id="resume-confirm" hidden class="stack">
          <label class="choice">
            <input type="checkbox" id="resume-check">
            <span><span class="choice-title">I've been checked by a physio or doctor, or the symptom has fully gone.</span></span>
          </label>
          <button class="btn btn-primary btn-block" id="resume-go" disabled>Resume</button>
        </div>
      </div>
    </div>`;

  const showBtn = $(container, "#show-resume");
  const confirmBox = $(container, "#resume-confirm");
  const check = $(container, "#resume-check");
  const go = $(container, "#resume-go");

  showBtn.addEventListener("click", () => {
    confirmBox.hidden = false;
    showBtn.hidden = true;
    check.focus();
  });
  check.addEventListener("change", () => (go.disabled = !check.checked));
  go.addEventListener("click", () => {
    if (!check.checked) return;
    resumeAfterConfirmation();
    ctx.render();
  });
}
