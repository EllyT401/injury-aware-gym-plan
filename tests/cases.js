// Test sentences for the safety checks. Add new ones here any time.
// Each case says what the checker SHOULD answer.
//   level:  "none" | "urgent" | "emergency"
//   strict: true to test as a self-diagnosing user

export const safetyCases = [
  // ---- Emergency ----
  { text: "I get chest pain when I squat", level: "emergency" },
  { text: "Tightness in my chest on the bike", level: "emergency" },
  { text: "I felt faint after the last set", level: "emergency" },
  { text: "I was short of breath and had to stop", level: "emergency" },
  { text: "Cant breathe properly during cardio", level: "emergency" },

  // ---- Urgent red flags (everyone) ----
  { text: "Numbness in my left foot", level: "urgent" },
  { text: "I have tingling down my leg", level: "urgent" },
  { text: "Pins and needles in my fingers", level: "urgent" },
  { text: "pins & needles after sitting", level: "urgent" },
  { text: "There is severe swelling around the ankle", level: "urgent" },
  { text: "My knee is badly swollen", level: "urgent" },
  { text: "I've noticed a loss of strength in my grip", level: "urgent" },
  { text: "Lost strength in my right arm", level: "urgent" },
  { text: "The pain wakes me up at night", level: "urgent" },
  { text: "night pain in the shoulder", level: "urgent" },
  { text: "Pain at night is worse", level: "urgent" },
  { text: "Problems with my bladder since the injury", level: "urgent" },
  { text: "I can't put weight on it", level: "urgent" },
  { text: "NUMB toes!!", level: "urgent" },
  { text: "Physio mentioned numbness is gone but still there some days", level: "urgent" },
  // Deliberately cautious: we flag even when the user says they DON'T have it.
  { text: "no numbness", level: "urgent" },

  // ---- Should NOT trigger for a normal user ----
  { text: "No deep knee bend", level: "none" },
  { text: "Avoid overhead press and heavy deadlifts", level: "none" },
  { text: "Physio said no running for 6 weeks", level: "none" },
  { text: "Mild ache in the lower back after sitting", level: "none" },
  { text: "Chest press makes my shoulder sore", level: "none" },
  { text: "Saddle height on the bike feels low", level: "none" },
  { text: "Weak glutes, working on single leg strength", level: "none" },
  { text: "", level: "none" },

  // ---- Stricter check for self-diagnosers ----
  { text: "My knee is swollen and sometimes gives way", level: "urgent", strict: true },
  { text: "Sharp pain when I twist", level: "urgent", strict: true },
  { text: "It keeps getting worse", level: "urgent", strict: true },
  { text: "Weak leg on the left side", level: "urgent", strict: true },
  { text: "Numbness in my foot", level: "urgent", strict: true },
  { text: "Chest pain on the rower", level: "emergency", strict: true },
  { text: "A bit stiff in the mornings", level: "none", strict: true },

  // The same wording is fine for someone NOT self-diagnosing (their physio has seen it)
  { text: "Sharp pain when I twist", level: "none" },
  { text: "Weak leg on the left side", level: "none" },
];

// Test sentences for mapping free text to tags.
//   tags: the tags we expect (empty list = should be left for the user to confirm)
export const tagCases = [
  { text: "no deep knee bend", tags: ["knee_bending"] },
  { text: "Avoid overhead reaching", tags: ["overhead_reach"] },
  { text: "no jumping", tags: ["impact"] },
  { text: "no twisting", tags: ["spinal_rotation"] },
  { text: "no heavy gripping", tags: ["heavy_gripping"] },
  { text: "no weight on my back", tags: ["spinal_loading"] },
  { text: "avoid lunges", tags: ["knee_bending"] },
  { text: "keep it gentle and listen to my body", tags: [] },
  { text: "see physio again in four weeks", tags: [] },
];
