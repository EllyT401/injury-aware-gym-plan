// App start-up and screen switching.

import { load, getState } from "./store.js";
import { loadData } from "./data.js";
import { $, $$, esc, applyPrefs } from "./util.js";
import { renderSetup } from "./screens/setup.js";
import { renderPause } from "./screens/pause.js";
import { renderTab, TABS } from "./screens/tabs.js";

const root = document.getElementById("app");
let currentTab = "today";
const ctx = { data: null, render };

function render() {
  const s = getState();
  applyPrefs(s.prefs);
  const setupDone = s.setup.complete;

  root.innerHTML = `
    <div class="reminder" role="note">Gentle reminder: your physio's or doctor's advice always comes first. This app isn't medical advice.</div>
    <main class="main ${setupDone ? "has-tabbar" : ""}" id="main"></main>
    ${
      setupDone
        ? `<nav class="tabbar" aria-label="Main">
            ${TABS.map(
              ([id, label, icon]) =>
                `<button type="button" data-tab="${id}" ${id === currentTab ? 'aria-current="page"' : ""}>
                  <span class="tab-icon" aria-hidden="true">${icon}</span><span>${label}</span>
                </button>`
            ).join("")}
          </nav>`
        : ""
    }`;

  const main = $(root, "#main");

  if (!setupDone) {
    if (s.pause.active) renderPause(main, ctx);
    else renderSetup(main, ctx);
  } else if (s.pause.active && currentTab !== "settings") {
    // A pause blocks Today, Plan and Progress. Settings stays open so the
    // user can still export their data.
    renderPause(main, ctx);
  } else {
    renderTab(currentTab, main, ctx);
  }

  $$(root, ".tabbar button").forEach((b) =>
    b.addEventListener("click", () => {
      currentTab = b.dataset.tab;
      render();
    })
  );

  window.scrollTo(0, 0);
  const heading = main.querySelector("h1");
  if (heading) heading.focus({ preventScroll: true });
}

function showFatal(error) {
  console.error(error);
  root.innerHTML = `
    <main class="main">
      <div class="alert alert-danger" role="alert">
        <span class="alert-icon" aria-hidden="true">⚠️</span>
        <div class="alert-body">
          <h1>The app couldn't start</h1>
          <p>The safety checks couldn't be loaded, so the app won't run without them. Check your connection and try again.</p>
          <p class="muted small">${esc(error && error.message)}</p>
          <button class="btn btn-block" onclick="location.reload()">Try again</button>
        </div>
      </div>
    </main>`;
}

async function start() {
  load();
  try {
    ctx.data = await loadData();
  } catch (error) {
    showFatal(error);
    return;
  }
  render();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./service-worker.js").catch((e) => console.warn("Offline mode unavailable", e));
  }
}

start();
