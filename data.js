// ===== Tournament source of truth =====
// This file holds the OFFICIAL results. Editing + committing this file is how the
// public scoreboard updates. Use admin.html to generate a new version of this file.
//
// Random draw (Python random.shuffle, dealt into A/B/C):
//   Group A: Anderson Yamamoto, Shahed Abu Qamar, Ashwin Risbood
//   Group B: Adham Badr, Francesco Fiori, Kartikeya Gokhale
//   Group C: Sarat Chebrolu, Pratik Moona, Dinesh
//
// Every match is BEST OF 3 games. Each game stores point scores {a, b}.
// players = [A1, A2, A3, B1, B2, B3, C1, C2, C3]
window.TOURNAMENT = {
  version: 2,
  players: [
    "Anderson Yamamoto", "Shahed Abu Qamar", "Ashwin Risbood",
    "Adham Badr", "Francesco Fiori", "Kartikeya Gokhale",
    "Sarat Chebrolu", "Pratik Moona", "Dinesh"
  ],
  // Each group has 3 round-robin matches in order: [A1vA2, A1vA3, A2vA3].
  // Each match = { games: [game1, game2, game3] }, each game = { a, b } point score.
  group: {
    A: [emptyMatch(), emptyMatch(), emptyMatch()],
    B: [emptyMatch(), emptyMatch(), emptyMatch()],
    C: [emptyMatch(), emptyMatch(), emptyMatch()]
  },
  playoff: {
    q1: emptyMatch(),     // Q1: Seed 1 v Seed 2
    q2: emptyMatch(),     // Q2: Loser of Q1 v Seed 3
    final: emptyMatch()   // Q3 (Final): Winner of Q1 v Winner of Q2
  }
};

// helper used above to keep this file short
function emptyMatch() {
  return { games: [{ a: "", b: "" }, { a: "", b: "" }, { a: "", b: "" }] };
}
