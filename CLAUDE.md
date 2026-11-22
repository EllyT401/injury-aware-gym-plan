# Injury-Aware Gym Plan App: Build Brief

A brief for building the first prototype, intended to be pasted into Claude Code.

## 1. Concept

A mobile-friendly web app that helps people with injuries personalise a gym plan around their physio or rehab guidance. The user enters their injury and restrictions, and the app shows what is fine to do, what to modify, and what to skip. All data is stored on the user's phone.

## 2. Prototype scope

Gym plans only. Keep it free to host and run. Other sports modes (for example Ironman, running, cycling, swimming) are a possible separate app later and are out of scope for now.

## 3. Technical approach for the prototype

- A single-page web app (HTML, CSS and JavaScript), mobile-first, installable to the home screen as a PWA.
- Data stored locally in the browser (localStorage or IndexedDB). No backend and no accounts.
- Free hosting on GitHub Pages or Netlify.
- Keep all colours, fonts and spacing in one central place (CSS variables) so the look can be restyled quickly.
- No paid AI calls in the prototype. Use keyword matching for free-text input.

## 4. Safety requirements (highest priority)

- A disclaimer on first launch that the user must acknowledge: the app is not certified medical advice, and the physio's or doctor's guidance is the authority.
- A short, gentle reminder that stays visible throughout the app.
- An urgent-symptom check on any free text the user types, including setup, notes and flare-ups. Keywords include numbness, tingling, chest pain, severe swelling, loss of strength, night pain, and similar red flags. If one is found, pause the plan and tell the user to see a professional before training.
- A stricter version of this check for self-diagnosing users, with general guidance only and a clear nudge to see a physio or doctor.
- Severe flare-ups or urgent symptoms always pause the plan and recommend professional help, even when automatic adjustment is switched on. No setting can override this.

## 5. Setup flow (first-time user)

1. Disclaimer acknowledgement.
2. Choose which user type applies:
   - I have no gym plan yet (the app builds one).
   - I have a plan already (paste or enter it, and the app modifies it around the injury).
   - I'm self-diagnosing (more cautious mode with a stronger professional-advice nudge).
3. Enter the injury and restrictions using a mix of both: a pick list of common injuries and restrictions, plus a free-text box for the physio's specifics.
4. Choose available equipment (see section 8).
5. Set preferences (see section 10).

## 6. Exercise library and tag matching

- Build an original, hand-written library of roughly 60 to 80 exercises, plus about 10 extra bodyweight options for travel. Write original descriptions and use only original or properly licensed images and videos. This avoids copyright problems if the app is ever sold. An open dataset can be used temporarily to move fast but should be replaced before charging anyone. Licences should be checked, and a lawyer consulted before any paid launch.
- Suggested spread: about 15 legs, 10 chest and shoulders, 10 back and pulling, 8 arms, 10 core (including gentle options such as dead bugs and planks), and 10 low-impact cardio and mobility options such as cycling, rowing, walking and band work.
- Every body area should have at least two alternatives at different difficulty levels, so a red-flagged exercise always has a sensible swap.
- Each exercise has: name, short description, equipment, muscles worked, and movement and body-area tags (for example knee bending, spinal loading, overhead reach, impact, heavy gripping).
- Restrictions, whether picked or typed, are converted into the same tags. An exercise sharing a tag with a restriction is flagged: strong overlap is red (skip), partial overlap is amber (modify, and suggest a swap from the same muscle group that avoids the tag).
- Free text is mapped by keywords (for example "no deep knee bend" maps to the knee bending tag). Anything the app cannot confidently map is shown to the user to confirm rather than guessed.

## 7. Plan screen (Today)

- Opens on today's session as a short list of exercises, designed for use mid-workout with sweaty hands.
- Each exercise shows sets, reps and a tappable weight box to log.
- A status tag on each exercise: green (fine), amber (modified), red (skip), with a one-line reason drawn from the restrictions, for example "avoid deep knee bend, use box squat instead". Use icons or labels as well as colour, for colour-blind users.
- A pain check after each exercise using a 1 to 10 slider.
- A big, always-visible Flare-up button.

## 8. Equipment profiles

- In setup the user picks what they have: full gym, a few dumbbells, bands, or bodyweight only.
- Only exercises matching the chosen equipment are offered.
- Users can save multiple profiles (for example home, gym, travel) and switch between them.
- A quick "Hotel room mode" on the plan screen swaps today's session for a bodyweight or band version that still respects their restrictions.
- Progress is tracked per exercise, so swapping profiles never wipes history. Each session records which profile was used, so a block like "hotel week" shows clearly. When returning to the gym after time away, the app suggests starting a little lighter than the last gym weight.

## 9. Flare-ups

- The Flare-up button asks where it hurts, how bad it is out of 10, and what triggered it, then runs the urgent-symptom check.
- High pain or urgent symptoms: pause the plan and recommend seeing a professional.
- Milder flare-ups: switch to a gentler version of the week (lower weights, fewer sets, skip affected exercises) and keep it flagged until the user logs a few lower-pain sessions in a row.
- Prompt the user to note what their physio said about flare-ups.
- A settings toggle lets the user choose "Ask me before changing my plan" (the default) or "Adjust automatically". The safety exception in section 4 always applies.

## 10. Progress

- Per exercise, two simple charts side by side: weight over time and pain over time.
- A movement-pattern view that groups similar exercises (for example all squat-type movements) and tracks pain and effort across them, so a week on bodyweight does not look like lost progress.
- A weekly summary at the top, for example "three sessions done, pain trending down".
- A notes field to bring to the physio, and an export button so the log can be shared at appointments.

## 11. Navigation, look and personalisation

- A bottom tab bar: Today, Plan, Progress, Settings.
- Style: clinical and calm. Clean layout, lots of white space, one main accent colour, large tap targets, consistent spacing. This will be iterated after the prototype is seen.
- User preferences: plan view as day, week or simple checklist; light and dark mode; adjustable text size; kilograms or pounds; and the approve-or-automatic toggle for plan changes.

## 12. Future growth (not for the prototype)

- Cloud sync and sign-in with a free-tier backend such as Supabase or Firebase, moving to paid tiers as storage and traffic grow.
- Proper privacy terms and secure storage, since this is health-related data.
- Wrapping the web app to publish in the app stores.
- An AI model to read free-text plans and uploaded plans, possibly powering a separate multi-sport mode.

## 13. Suggested build order

1. Setup page with the disclaimer, user types and urgent-symptom checks.
2. Exercise library with tags, and the matching logic.
3. Today and plan screens with logging and pain sliders.
4. Progress charts and export.
5. Flare-up flow and settings.
6. Equipment profiles and hotel room mode.
7. Visual polish and restyling.
