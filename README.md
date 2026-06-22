# 9-Player Tournament Tracker

A static web app for a **9-player tournament**: three groups of three play a round-robin,
the three group winners are seeded 1–3, and the title is decided with an **IPL-style
playoff** (Qualifier 1 → Qualifier 2 → Final), so the top two seeds get a second chance.

## The draw

Players were drawn at random (Python `random.shuffle`, then dealt into A/B/C):

| Group A | Group B | Group C |
|---|---|---|
| Anderson Yamamoto | Adham Badr | Sarat Chebrolu |
| Shahed Abu Qamar | Francesco Fiori | Pratik Moona |
| Ashwin Risbood | Kartikeya Gokhale | Dinesh |

## Format

1. **Groups** — round-robin (3 matches each). Win = 2 pts, Tie = 1, Loss = 0.
   Ranked by points, then score difference, then points scored.
2. **Seeding** — the 3 group winners are seeded 1–3.
3. **Playoffs**
   - **Qualifier 1:** Seed 1 v Seed 2 — winner → Final, loser gets a second chance.
   - **Qualifier 2:** Loser of Q1 v Seed 3 — loser is out.
   - **Final:** Winner of Q1 v Winner of Q2.

## Files

| File | Purpose |
|---|---|
| `index.html` | **Public, read-only** scoreboard everyone sees. |
| `admin.html` | **Passcode-gated editor** for the organiser. |
| `data.js`    | The **official results** — the single source of truth. |
| `logic.js`   | Shared standings/seeding/bracket logic + rendering. |
| `style.css`  | Styles. |

## Who can update the scores

GitHub Pages is static (no server), so visitors can never change the shared scoreboard —
the official results live in `data.js`, and **only the repo owner can push it**. That push
access *is* the access control.

To update scores:
1. Open `admin.html`, enter the passcode (default `topspin2026` — change `ADMIN_PASS` in `admin.html`).
2. Type in the scores. Standings, seeds, and the bracket update live.
3. Click **Generate data.js** → **Download** (or **Copy**).
4. Replace `data.js` in the repo and commit/push (terminal, or GitHub's web "upload files").
5. The public `index.html` now shows the new results.

## Run locally

Open `index.html` (or `admin.html`) directly in a browser, or serve the folder:

```
cd tournament-app
python3 -m http.server 8000   # then visit http://localhost:8000
```

No build step, no dependencies — plain HTML/CSS/JavaScript.
