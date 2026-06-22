// ===== Tournament source of truth =====
// This file holds the OFFICIAL results. Editing + committing this file is how the
// public scoreboard updates. Use admin.html to generate a new version of this file.
//
// Random draw (Python random.shuffle, dealt into A/B/C):
//   Group A: Anderson Yamamoto, Shahed Abu Qamar, Ashwin Risbood
//   Group B: Adham Badr, Francesco Fiori, Kartikeya Gokhale
//   Group C: Sarat Chebrolu, Pratik Moona, Dinesh
//
// players = [A1, A2, A3, B1, B2, B3, C1, C2, C3]
window.TOURNAMENT = {
  players: [
    "Anderson Yamamoto", "Shahed Abu Qamar", "Ashwin Risbood",
    "Adham Badr", "Francesco Fiori", "Kartikeya Gokhale",
    "Sarat Chebrolu", "Pratik Moona", "Dinesh"
  ],
  // Each group has 3 round-robin matches in order: [A1vA2, A1vA3, A2vA3]
  group: {
    A: [{ a: "", b: "" }, { a: "", b: "" }, { a: "", b: "" }],
    B: [{ a: "", b: "" }, { a: "", b: "" }, { a: "", b: "" }],
    C: [{ a: "", b: "" }, { a: "", b: "" }, { a: "", b: "" }]
  },
  playoff: {
    q1: { a: "", b: "" },     // Seed 1 v Seed 2
    q2: { a: "", b: "" },     // Loser of Q1 v Seed 3
    final: { a: "", b: "" }   // Winner Q1 v Winner Q2
  }
};
