// Small HTML building blocks shared by the screens.

import { esc } from "./util.js";

/** A big, tappable checkbox or radio button. */
export function choice(type, name, value, title, desc = "", checked = false) {
  return `
    <label class="choice">
      <input type="${type}" name="${esc(name)}" value="${esc(value)}" ${checked ? "checked" : ""}>
      <span>
        <span class="choice-title">${esc(title)}</span>
        ${desc ? `<span class="choice-desc">${esc(desc)}</span>` : ""}
      </span>
    </label>`;
}

/** A message box. Always has an icon as well as colour (for colour-blind users). */
export function alertBox(kind, icon, html) {
  return `
    <div class="alert alert-${kind}" role="${kind === "danger" ? "alert" : "note"}">
      <span class="alert-icon" aria-hidden="true">${icon}</span>
      <div class="alert-body">${html}</div>
    </div>`;
}

/** A group of radio buttons with a heading. */
export function radioGroup(name, legend, options, current) {
  return `
    <fieldset style="border:0;padding:0;margin:0">
      <legend class="field-label">${esc(legend)}</legend>
      <div class="choices choices-2col">
        ${options.map(([value, title, desc]) => choice("radio", name, value, title, desc, value === current)).join("")}
      </div>
    </fieldset>`;
}
