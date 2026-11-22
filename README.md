# Injury-Aware Gym Plan

A mobile-friendly web app (installable PWA) that helps people with injuries personalise a gym plan around their physio's guidance. Everything is stored on the user's phone. There is no backend and there are no accounts.

> This app is not certified medical advice. A physio's or doctor's guidance is always the authority.

See [CLAUDE.md](CLAUDE.md) for the full build brief and build order.

## Status

- **Stage 1: setup and safety checks.** Built, awaiting review.
- Stages 2 to 7 (exercise library, Today screen, progress, flare-ups, equipment profiles, polish) are not started.

## Run it on your computer

The app needs to be opened through a small local web server (double-clicking `index.html` won't work, because browsers block the app's code files from file:// pages).

```
python -m http.server 8000
```

Run that in this folder, then open <http://localhost:8000>. Press `Ctrl+C` in the terminal to stop it.
(No Python? `npx serve` also works.)

To see it at phone size: press `F12` in Chrome or Edge, then click the phone/tablet icon.

## Test it

- **Safety tests in the browser:** open <http://localhost:8000/tests/safety-tests.html>. Every row should say PASS.
- **The same tests from the command line:** `node tests/run-node.mjs`
- Add new test sentences in [tests/cases.js](tests/cases.js).

## Where things are

| Path | What it is |
| --- | --- |
| `index.html` | The one page the app loads into |
| `manifest.webmanifest` | Makes the app installable (name, icons, colours) |
| `service-worker.js` | Saves the app's files so it works offline |
| `css/tokens.css` | **All colours, fonts and spacing.** Restyle the app here |
| `css/base.css`, `css/components.css` | Layout and reusable pieces, using the tokens |
| `js/app.js` | Starts the app and switches screens |
| `js/store.js` | Saves and loads data on the phone |
| `js/safety/redflags.js` | The urgent-symptom checker |
| `js/safety/pause.js` | Pause rules and pain thresholds |
| `js/tags.js` | Turns the user's own words into movement tags |
| `js/screens/` | One file per screen |
| `data/redflags.json` | Red-flag phrase lists. Editable without touching code |
| `data/tags.json` | Movement tags and the everyday words that map to them |
| `data/injuries.json` | The injury and restriction pick lists |
| `tests/` | Safety tests |

## Safety rules in short

- The disclaimer must be accepted before anything else.
- A gentle reminder banner shows on every screen.
- Any free text is checked for red flags. A hit pauses the plan and recommends seeing a professional (emergency wording for things like chest pain).
- Self-diagnosing users get a stricter check and general guidance only.
- Nothing in Settings can override a pause. The pause can only be lifted by the user confirming they've been checked or the symptom has gone.
- The red-flag, tag and injury lists are **drafts** and need review by a physio before any paid launch.

## Putting it online (GitHub Pages)

All file paths in the app are relative, so it works from `https://<username>.github.io/injury-aware-gym-plan/`. In the GitHub repo: Settings, then Pages, then deploy from the `main` branch, root folder.
