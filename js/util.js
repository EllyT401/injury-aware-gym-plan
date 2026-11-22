// Small helpers shared by the screens.

/** Make text safe to put inside HTML (stops typed text being treated as code). */
export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

export const $ = (root, selector) => root.querySelector(selector);
export const $$ = (root, selector) => Array.from(root.querySelectorAll(selector));

/** Apply theme and text-size preferences to the page. */
export function applyPrefs(prefs) {
  const html = document.documentElement;
  if (prefs.theme === "light" || prefs.theme === "dark") html.dataset.theme = prefs.theme;
  else delete html.dataset.theme;
  html.dataset.textsize = prefs.textSize;
}

/** Is the app installed to the home screen (rather than open in a browser tab)? */
export function isInstalled() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}
