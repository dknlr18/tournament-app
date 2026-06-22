# 9-Team Tournament Tracker

A single-page web app for running a **9-team tournament**: three groups of three play a
round-robin, the three group winners are seeded 1–3, and the title is decided with an
**IPL-style playoff** (Qualifier 1 → Qualifier 2 → Final), so the top two seeds get a
second chance.

## Format

1. **Groups** — 3 groups of 3, round-robin (3 matches each). Win = 2 pts, Tie = 1, Loss = 0.
   Ranked by points, then score difference, then points scored.
2. **Seeding** — the 3 group winners are seeded 1–3 by their group record.
3. **Playoffs**
   - **Qualifier 1:** Seed 1 v Seed 2 — winner goes straight to the Final, loser gets a second chance.
   - **Qualifier 2:** Loser of Q1 v Seed 3 — loser is eliminated.
   - **Final:** Winner of Q1 v Winner of Q2.

## Usage

Just open `index.html` in a browser, or visit the hosted GitHub Pages site. Enter team
names and match scores — standings, seeds, and the bracket update automatically. All data
is saved in your browser via `localStorage`. Use **Reset everything** to start over.

No build step, no dependencies — plain HTML/CSS/JavaScript.
