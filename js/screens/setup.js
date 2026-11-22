// The first-time setup flow.
//
// Steps: disclaimer -> user type -> (self-diagnosing OR paste plan) ->
//        injury and restrictions -> confirm what we understood ->
//        equipment -> preferences
//
// Every box where the user can type free text is checked for red flags before
// the app moves on. A hit pauses everything (see safety/pause.js).

import { esc, $, $$ } from "../util.js";
import { getState, update } from "../store.js";
import { checkText } from "../safety/redflags.js";
import { pauseFor } from "../safety/pause.js";
import { mapText } from "../tags.js";
import { choice, alertBox } from "../ui.js";
import { renderPrefs, bindPrefs } from "./prefs.js";

export function stepsFor(userType) {
  const steps = ["disclaimer", "usertype"];
  if (userType === "selfdx") steps.push("selfdx");
  if (userType === "hasplan") steps.push("plan");
  steps.push("injury", "confirm", "equipment", "prefs");
  return steps;
}

export function renderSetup(container, ctx) {
  const s = getState();
  const steps = stepsFor(s.userType);
  let step = s.setup.step;
  if (!steps.includes(step)) step = steps[0];
  const index = steps.indexOf(step);

  const nav = {
    goto(to) {
      update((st) => { st.setup.step = to; });
      ctx.render();
    },
    next() { nav.goto(stepsFor(getState().userType)[index + 1]); },
    back() { nav.goto(stepsFor(getState().userType)[index - 1]); },
  };

  const view = VIEWS[step](ctx, s, nav);
  const progress =
    step === "disclaimer"
      ? ""
      : `<div class="progress">Step ${index + 1} of ${steps.length}</div>
         <div class="progress-bar" aria-hidden="true"><span style="width:${Math.round(((index + 1) / steps.length) * 100)}%"></span></div>`;

  container.innerHTML = progress + view.html;
  view.bind(container);
}

/** Check typed text. Returns true if it's fine to continue; otherwise pauses. */
function passesSafetyCheck(ctx, text, source) {
  const strict = getState().userType === "selfdx";
  const result = checkText(text, ctx.data.rules, { strict });
  if (result.level === "none") return true;
  pauseFor(result, { source, strict });
  ctx.render();
  return false;
}

const backButton = `<button class="btn btn-block" id="back" type="button">Back</button>`;

const VIEWS = {
  // ---------------------------------------------------------------- 1
  disclaimer(ctx, s, nav) {
    return {
      html: `
        <div class="stack">
          <h1 tabindex="-1">Before you start</h1>
          <div class="card">
            <ul>
              <li><strong>This app is not certified medical advice.</strong> It can't diagnose or treat an injury.</li>
              <li><strong>Your physio's or doctor's guidance is the authority.</strong> If this app and your professional ever disagree, follow your professional.</li>
              <li>If you notice warning signs such as numbness, tingling, chest pain, severe swelling or night pain, stop and see a professional before training.</li>
              <li>Your information stays on this phone. It isn't sent anywhere.</li>
            </ul>
          </div>
          <label class="choice">
            <input type="checkbox" id="agree">
            <span><span class="choice-title">I understand and agree</span></span>
          </label>
          <div class="actions">
            <button class="btn btn-primary btn-block" id="continue" disabled>Continue</button>
            <button class="btn btn-quiet btn-block" id="decline" type="button">I don't agree</button>
          </div>
          <div id="declined" hidden>
            ${alertBox("info", "ℹ️", "<p>That's okay. The app can't be used without agreeing to this. You can close this page, or tick the box above if you change your mind.</p>")}
          </div>
        </div>`,
      bind(c) {
        const agree = $(c, "#agree");
        const cont = $(c, "#continue");
        agree.addEventListener("change", () => {
          cont.disabled = !agree.checked;
          if (agree.checked) $(c, "#declined").hidden = true;
        });
        $(c, "#decline").addEventListener("click", () => ($(c, "#declined").hidden = false));
        cont.addEventListener("click", () => {
          if (!agree.checked) return;
          update((st) => { st.disclaimer.acceptedAt = new Date().toISOString(); });
          nav.next();
        });
      },
    };
  },

  // ---------------------------------------------------------------- 2
  usertype(ctx, s, nav) {
    const options = [
      ["none", "I have no gym plan yet", "The app will build one around my injury."],
      ["hasplan", "I have a plan already", "I'll paste or enter it, and the app will adjust it around my injury."],
      ["selfdx", "I'm self-diagnosing", "I haven't seen a physio or doctor. The app will be more cautious and encourage me to get checked."],
    ];
    return {
      html: `
        <div class="stack">
          <h1 tabindex="-1">Which sounds most like you?</h1>
          <div class="choices">
            ${options.map(([v, t, d]) => choice("radio", "usertype", v, t, d, s.userType === v)).join("")}
          </div>
          <div class="actions">
            <button class="btn btn-primary btn-block" id="continue" ${s.userType ? "" : "disabled"}>Continue</button>
            ${backButton}
          </div>
        </div>`,
      bind(c) {
        const cont = $(c, "#continue");
        $$(c, 'input[name="usertype"]').forEach((r) =>
          r.addEventListener("change", () => {
            cont.disabled = false;
          })
        );
        cont.addEventListener("click", () => {
          const picked = $(c, 'input[name="usertype"]:checked');
          if (!picked) return;
          update((st) => { st.userType = picked.value; });
          nav.next();
        });
        $(c, "#back").addEventListener("click", nav.back);
      },
    };
  },

  // ---------------------------------------------------------------- 3a
  selfdx(ctx, s, nav) {
    return {
      html: `
        <div class="stack">
          <h1 tabindex="-1">A quick word of caution</h1>
          ${alertBox(
            "warn",
            "⚠️",
            `<p><strong>This app can't tell you what's wrong.</strong> Without a diagnosis, it's easy to train on something that needs rest or treatment.</p>
             <p>Please see a physio or doctor as soon as you can. We'll keep the guidance general until then, and we check what you write more strictly.</p>`
          )}
          <div>
            <label class="field-label" for="text">What's been going on? (optional)</label>
            <p class="hint">Describe it in your own words. It will be useful to show a physio or doctor.</p>
            <textarea id="text">${esc(s.notes.selfDx)}</textarea>
          </div>
          <label class="choice">
            <input type="checkbox" id="ack">
            <span><span class="choice-title">I understand this app can't diagnose me, and I should see a physio or doctor.</span></span>
          </label>
          <div class="actions">
            <button class="btn btn-primary btn-block" id="continue" disabled>Continue</button>
            ${backButton}
          </div>
        </div>`,
      bind(c) {
        const ack = $(c, "#ack");
        const cont = $(c, "#continue");
        ack.addEventListener("change", () => (cont.disabled = !ack.checked));
        cont.addEventListener("click", () => {
          const text = $(c, "#text").value;
          update((st) => { st.notes.selfDx = text; });
          if (passesSafetyCheck(ctx, text, "what's been going on")) nav.next();
        });
        $(c, "#back").addEventListener("click", nav.back);
      },
    };
  },

  // ---------------------------------------------------------------- 3b
  plan(ctx, s, nav) {
    return {
      html: `
        <div class="stack">
          <h1 tabindex="-1">Your current plan</h1>
          <div>
            <label class="field-label" for="text">Paste or type your plan</label>
            <p class="hint">For example, a list of exercises with sets and reps. You can leave this empty and add it later. The app will adjust the plan around your injury in a later update.</p>
            <textarea id="text" style="min-height:180px">${esc(s.notes.planText)}</textarea>
          </div>
          <div class="actions">
            <button class="btn btn-primary btn-block" id="continue">Continue</button>
            ${backButton}
          </div>
        </div>`,
      bind(c) {
        $(c, "#continue").addEventListener("click", () => {
          const text = $(c, "#text").value;
          update((st) => { st.notes.planText = text; });
          if (passesSafetyCheck(ctx, text, "your plan")) nav.next();
        });
        $(c, "#back").addEventListener("click", nav.back);
      },
    };
  },

  // ---------------------------------------------------------------- 4
  injury(ctx, s, nav) {
    const { injuries, restrictions } = ctx.data;
    return {
      html: `
        <div class="stack">
          <h1 tabindex="-1">Your injury and restrictions</h1>
          <fieldset style="border:0;padding:0;margin:0">
            <legend class="field-label">What's the injury? (pick any that apply)</legend>
            <div class="choices choices-2col">
              ${injuries.map((i) => choice("checkbox", "injury", i.id, i.label, "", s.injuries.includes(i.id))).join("")}
            </div>
          </fieldset>
          <fieldset style="border:0;padding:0;margin:0">
            <legend class="field-label">Restrictions from your physio or doctor</legend>
            <div class="choices choices-2col">
              ${restrictions.map((r) => choice("checkbox", "restr", r.id, r.label, "", s.pickedRestrictions.includes(r.id))).join("")}
            </div>
          </fieldset>
          <div>
            <label class="field-label" for="physio">Anything else your physio said? (optional)</label>
            <p class="hint">Use your own words, for example "no deep knee bend" or "avoid anything overhead for 6 weeks".</p>
            <textarea id="physio">${esc(s.notes.physio)}</textarea>
          </div>
          <div class="field-error" id="error" role="alert"></div>
          <div class="actions">
            <button class="btn btn-primary btn-block" id="continue">Continue</button>
            ${backButton}
          </div>
        </div>`,
      bind(c) {
        $(c, "#continue").addEventListener("click", () => {
          const injuryIds = $$(c, 'input[name="injury"]:checked').map((i) => i.value);
          const restrIds = $$(c, 'input[name="restr"]:checked').map((i) => i.value);
          const physio = $(c, "#physio").value;

          // Always save what they typed so they never lose it, even if we pause.
          update((st) => {
            st.injuries = injuryIds;
            st.pickedRestrictions = restrIds;
            st.notes.physio = physio;
          });

          if (!injuryIds.length && !restrIds.length && physio.trim().length < 3) {
            $(c, "#error").textContent = "Please pick at least one injury or restriction, or describe it in the box.";
            return;
          }
          if (!passesSafetyCheck(ctx, physio, "your injury details")) return;

          const mapping = mapText(physio, ctx.data.tags);
          update((st) => { st.setup.draft.mapping = mapping; });
          nav.next();
        });
        $(c, "#back").addEventListener("click", nav.back);
      },
    };
  },

  // ---------------------------------------------------------------- 5
  confirm(ctx, s, nav) {
    const { injuries, restrictions, tagLabels } = ctx.data;
    const mapping = s.setup.draft.mapping || { mapped: [], unmapped: [] };
    const tagLabel = (id) => tagLabels[id] || id;

    const pickedInjuries = injuries.filter((i) => s.injuries.includes(i.id));
    const pickedRestr = restrictions.filter((r) => s.pickedRestrictions.includes(r.id));

    const fromLists = [...pickedInjuries.map((i) => ({ name: i.label, tags: i.tags })), ...pickedRestr.map((r) => ({ name: r.label, tags: r.tags }))];

    const listsHtml = fromLists.length
      ? fromLists.map((f) => `<div class="card"><strong>${esc(f.name)}</strong><div class="chips" style="margin-top:8px">${f.tags.map((t) => `<span class="chip">${esc(tagLabel(t))}</span>`).join("")}</div></div>`).join("")
      : `<p class="muted">You didn't pick anything from the lists.</p>`;

    const mappedHtml = mapping.mapped
      .map(
        (m, i) => `
        <div class="card stack" data-mapped="${i}">
          <div>You wrote: <em>"${esc(m.clause)}"</em></div>
          <div class="choices">
            ${m.tags.map((t) => choice("checkbox", `m${i}`, t, `Avoid: ${tagLabel(t)}`, "", true)).join("")}
          </div>
        </div>`
      )
      .join("");

    const tagOptions = Object.entries(tagLabels)
      .map(([id, label]) => `<option value="${esc(id)}">${esc(label)}</option>`)
      .join("");
    const unmappedHtml = mapping.unmapped
      .map(
        (u, i) => `
        <div class="card stack" data-unmapped="${i}">
          <div>You wrote: <em>"${esc(u)}"</em></div>
          <label class="field-label" for="u${i}">We couldn't tell what this means for exercises. What fits best?</label>
          <select id="u${i}">
            <option value="">Just keep it as a note (no change to exercises)</option>
            ${tagOptions}
          </select>
        </div>`
      )
      .join("");

    const wordsSection =
      mapping.mapped.length || mapping.unmapped.length
        ? `<h2>From your own words</h2>
           <p class="muted">We matched some of your words to movements. <strong>Untick anything that isn't something to avoid</strong> (for example, something you <em>can</em> do). We never guess: anything we're unsure about is below for you to decide.</p>
           ${mappedHtml}${unmappedHtml}`
        : "";

    return {
      html: `
        <div class="stack">
          <h1 tabindex="-1">Here's what we understood</h1>
          <p>Please check this carefully. This is what the app will avoid when it looks at exercises.</p>
          <h2>From your pick lists</h2>
          ${listsHtml}
          ${wordsSection}
          ${alertBox("info", "ℹ️", "<p>If anything here doesn't match what your physio told you, go back and change it. Your physio's advice always wins.</p>")}
          <div class="actions">
            <button class="btn btn-primary btn-block" id="continue">This looks right</button>
            ${backButton}
          </div>
        </div>`,
      bind(c) {
        $(c, "#continue").addEventListener("click", () => {
          const restrictionsOut = [];
          const add = (tag, source, evidence = "") => restrictionsOut.push({ tag, source, evidence });

          for (const i of pickedInjuries) i.tags.forEach((t) => add(t, `injury:${i.id}`));
          for (const r of pickedRestr) r.tags.forEach((t) => add(t, `picked:${r.id}`));

          mapping.mapped.forEach((m, i) => {
            $$(c, `input[name="m${i}"]:checked`).forEach((box) => add(box.value, "text", m.clause));
          });

          const notes = [];
          mapping.unmapped.forEach((u, i) => {
            const chosen = $(c, `#u${i}`).value;
            if (chosen) add(chosen, "text-confirmed", u);
            else notes.push(u);
          });

          update((st) => {
            st.restrictions = restrictionsOut;
            st.notes.unmapped = notes;
          });
          nav.next();
        });
        $(c, "#back").addEventListener("click", nav.back);
      },
    };
  },

  // ---------------------------------------------------------------- 6
  equipment(ctx, s, nav) {
    const profile = s.profiles.find((p) => p.id === s.activeProfileId) || s.profiles[0];
    const has = (k) => profile.equipment.includes(k);
    return {
      html: `
        <div class="stack">
          <h1 tabindex="-1">What equipment do you have?</h1>
          <div>
            <label class="field-label" for="pname">Name this setup</label>
            <input type="text" id="pname" value="${esc(profile.name)}" maxlength="40">
          </div>
          <fieldset style="border:0;padding:0;margin:0">
            <legend class="field-label">Tick everything you have</legend>
            <div class="choices">
              ${choice("checkbox", "equip", "full_gym", "Full gym", "Machines, barbells, dumbbells and cables", has("full_gym"))}
              ${choice("checkbox", "equip", "dumbbells", "A few dumbbells", "", has("dumbbells"))}
              ${choice("checkbox", "equip", "bands", "Resistance bands", "", has("bands"))}
              ${choice("checkbox", "equip", "bodyweight", "Bodyweight only", "No equipment needed", has("bodyweight"))}
            </div>
          </fieldset>
          <p class="hint">Later you'll be able to save more setups (for example home, gym and travel) and switch between them.</p>
          <div class="field-error" id="error" role="alert"></div>
          <div class="actions">
            <button class="btn btn-primary btn-block" id="continue">Continue</button>
            ${backButton}
          </div>
        </div>`,
      bind(c) {
        $(c, "#continue").addEventListener("click", () => {
          const equipment = $$(c, 'input[name="equip"]:checked').map((i) => i.value);
          if (!equipment.length) {
            $(c, "#error").textContent = "Please tick at least one option. Choose 'Bodyweight only' if you have no equipment.";
            return;
          }
          const name = $(c, "#pname").value.trim() || "My setup";
          update((st) => {
            const p = st.profiles.find((x) => x.id === st.activeProfileId) || st.profiles[0];
            p.name = name;
            p.equipment = equipment;
          });
          // Any typed text gets the safety check, even a setup name.
          if (passesSafetyCheck(ctx, name, "the setup name")) nav.next();
        });
        $(c, "#back").addEventListener("click", nav.back);
      },
    };
  },

  // ---------------------------------------------------------------- 7
  prefs(ctx, s, nav) {
    return {
      html: `
        <div class="stack">
          <h1 tabindex="-1">Your preferences</h1>
          <p class="muted">You can change any of these later in Settings.</p>
          ${renderPrefs(s.prefs)}
          <div class="actions">
            <button class="btn btn-primary btn-block" id="finish">Finish setup</button>
            ${backButton}
          </div>
        </div>`,
      bind(c) {
        bindPrefs(c);
        $(c, "#finish").addEventListener("click", () => {
          update((st) => {
            st.setup.complete = true;
            st.setup.step = "prefs";
          });
          ctx.render();
        });
        $(c, "#back").addEventListener("click", nav.back);
      },
    };
  },
};
