// ===== Shared tournament logic + rendering (used by index.html and admin.html) =====
const GROUPS = ["A", "B", "C"];
// round-robin pairings within a group of 3 (local indices)
const PAIRS = [[0, 1], [0, 2], [1, 2]];

function num(v) { return v === "" || v === null || v === undefined ? null : Number(v); }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function groupTeamIndex(g, li) { return GROUPS.indexOf(g) * 3 + li; }
function playerName(d, gi) { return d.players[gi] || `Player ${gi + 1}`; }

// ----- best-of-3 match maths -----
function gameWinner(game) {
  const a = num(game.a), b = num(game.b);
  if (a === null || b === null || a === b) return null;
  return a > b ? "a" : "b";
}
// Returns { aw, bw (games won), af, bf (total points), winner, complete, started }
function matchResult(match) {
  let aw = 0, bw = 0, af = 0, bf = 0, started = false;
  match.games.forEach(g => {
    const a = num(g.a), b = num(g.b);
    if (a !== null && b !== null) {
      started = true; af += a; bf += b;
      const w = gameWinner(g);
      if (w === "a") aw++; else if (w === "b") bw++;
    }
  });
  const winner = aw >= 2 ? "a" : bw >= 2 ? "b" : null;
  return { aw, bw, af, bf, winner, complete: winner !== null, started };
}
function matchWinner(match) { return matchResult(match).winner; }

// ----- standings -----
function standings(d, g) {
  const rows = [0, 1, 2].map(li => ({
    li, gi: groupTeamIndex(g, li), name: playerName(d, groupTeamIndex(g, li)),
    pld: 0, pts: 0, sf: 0, sa: 0,
  }));
  d.group[g].forEach((match, mi) => {
    const [la, lb] = PAIRS[mi];
    const ra = rows.find(r => r.li === la), rb = rows.find(r => r.li === lb);
    const r = matchResult(match);
    ra.sf += r.af; ra.sa += r.bf; rb.sf += r.bf; rb.sa += r.af;
    if (r.complete) { ra.pld++; rb.pld++; if (r.winner === "a") ra.pts++; else rb.pts++; }
  });
  rows.forEach(r => r.diff = r.sf - r.sa);
  // Rank by match points, then most points scored (PF), then fewest conceded (PA).
  rows.sort((x, y) => y.pts - x.pts || y.sf - x.sf || x.sa - y.sa);
  return rows;
}
function groupComplete(d, g) { return d.group[g].every(m => matchResult(m).complete); }
function seeds(d) {
  if (!GROUPS.every(g => groupComplete(d, g))) return null;
  const winners = GROUPS.map(g => ({ g, ...standings(d, g)[0] }));
  // Seed by points, then most points scored (PF), then fewest conceded (PA).
  winners.sort((x, y) => y.pts - x.pts || y.sf - x.sf || x.sa - y.sa);
  return winners;
}

// ===== Rendering =====
// opts = { editable, onChange:(path,value)=>void }
function renderAll(d, opts) {
  const editable = !!(opts && opts.editable);
  renderGroupMatches(d, editable);
  renderPlayoffs(d, editable);
  renderTables(d);
  renderSeeds(d);
  if (editable && opts.onChange) {
    document.querySelectorAll("input[type=number][data-path]").forEach(inp => {
      inp.addEventListener("input", e => {
        opts.onChange(JSON.parse(e.target.dataset.path), e.target.value);
        refocus(e.target);
      });
    });
  }
}

function scoreInput(path, value, editable) {
  if (editable) return `<input type="number" min="0" inputmode="numeric" data-path='${JSON.stringify(path)}' value="${value}" />`;
  return `<span class="pts">${value === "" ? "·" : escapeHtml(String(value))}</span>`;
}

// One best-of-3 match card
function matchCard(d, nameA, nameB, match, matchPath, editable) {
  const r = matchResult(match);
  const statusTxt = r.complete
    ? `${escapeHtml(r.winner === "a" ? nameA : nameB)} won ${Math.max(r.aw, r.bw)}–${Math.min(r.aw, r.bw)}`
    : r.started ? `In progress · ${r.aw}–${r.bw}` : "Not started";
  let aRun = 0, bRun = 0;
  const games = match.games.map((g, gi) => {
    const gw = gameWinner(g);
    const decidedBefore = aRun >= 2 || bRun >= 2; // match already won before this game
    if (gw === "a") aRun++; else if (gw === "b") bRun++;
    const dead = decidedBefore && gw === null; // an unneeded 3rd game
    return `<div class="grow ${dead ? 'dead' : ''}">
      <span class="glabel">G${gi + 1}</span>
      ${scoreInput([...matchPath, "games", gi, "a"], g.a, editable)}
      <span class="dash ${gw === 'a' ? 'wa' : gw === 'b' ? 'wb' : ''}">–</span>
      ${scoreInput([...matchPath, "games", gi, "b"], g.b, editable)}
    </div>`;
  }).join("");
  return `<div class="matchcard ${r.complete ? 'done' : ''}">
    <div class="mhead">
      <span class="pname ${r.winner === 'a' ? 'win' : ''}">${escapeHtml(nameA)}</span>
      <span class="tally">${r.aw}<small>–</small>${r.bw}</span>
      <span class="pname right ${r.winner === 'b' ? 'win' : ''}">${escapeHtml(nameB)}</span>
    </div>
    <div class="games">${games}</div>
    <div class="mstatus ${r.complete ? 'ok' : ''}">${statusTxt}</div>
  </div>`;
}

function renderGroupMatches(d, editable) {
  document.getElementById("groupsMatches").innerHTML = GROUPS.map(g => `
    <div class="gcol">
      <h3>Group ${g}</h3>
      ${PAIRS.map((p, mi) => matchCard(d,
        playerName(d, groupTeamIndex(g, p[0])),
        playerName(d, groupTeamIndex(g, p[1])),
        d.group[g][mi], ["group", g, mi], editable)).join("")}
    </div>`).join("");
}

function renderTables(d) {
  document.getElementById("tables").innerHTML = GROUPS.map(g => {
    const rows = standings(d, g);
    const done = groupComplete(d, g);
    return `<div class="tcard">
      <h3>Group ${g}</h3>
      <table>
        <tr><th class="name">Player</th><th title="Matches played">P</th>
            <th title="Matches won = points">Pts</th>
            <th title="Points scored — 1st tiebreaker">PF</th>
            <th title="Points conceded — 2nd tiebreaker (fewer is better)">PA</th></tr>
        ${rows.map((r, i) => `<tr class="${i === 0 && done ? 'leader' : ''}">
          <td class="name">${i === 0 && done ? '🥇 ' : ''}${escapeHtml(r.name)}</td>
          <td>${r.pld}</td><td><b>${r.pts}</b></td><td>${r.sf}</td><td>${r.sa}</td></tr>`).join("")}
      </table>
    </div>`;
  }).join("");
}

function renderSeeds(d) {
  const el = document.getElementById("seeds");
  const status = document.getElementById("seedStatus");
  const sd = seeds(d);
  if (!sd) {
    if (status) status.textContent = "— locks when all group matches finish";
    el.innerHTML = `<p class="pending">Group winners are seeded here once every group match is decided.</p>`;
    return;
  }
  if (status) status.textContent = "";
  el.innerHTML = `<div class="seedrow">` + sd.map((w, i) => `
    <div class="seedchip"><span class="s">Seed ${i + 1}</span>
      <span class="sn">${escapeHtml(w.name)}</span>
      <span class="sg">Group ${w.g} · ${w.pts} pts · ${w.sf} PF</span>
    </div>`).join("") + `</div>`;
}

function renderPlayoffs(d, editable) {
  const el = document.getElementById("playoffs");
  const champEl = document.getElementById("champion");
  const sd = seeds(d);
  if (!sd) {
    el.innerHTML = `<p class="pending">Playoffs unlock once all group matches are complete.</p>`;
    champEl.textContent = "";
    return;
  }
  const [s1, s2, s3] = sd;
  const q1w = matchWinner(d.playoff.q1);
  const q1Winner = q1w === "a" ? s1 : q1w === "b" ? s2 : null;
  const q1Loser = q1w === "a" ? s2 : q1w === "b" ? s1 : null;
  const q2w = matchWinner(d.playoff.q2);
  const q2Winner = q2w === "a" ? q1Loser : q2w === "b" ? s3 : null;
  const finw = matchWinner(d.playoff.final);
  const champion = finw === "a" ? q1Winner : finw === "b" ? q2Winner : null;

  el.innerHTML = `
    ${poCard(d, "q1", "Q1", "Seed 1 v Seed 2 · winner → Q3, loser drops to Q2", s1, s2, editable)}
    ${poCard(d, "q2", "Q2", "Loser of Q1 v Seed 3 · loser is eliminated", q1Loser, s3, editable)}
    ${poCard(d, "final", "Q3 · Final", "Winner of Q1 v Winner of Q2 · wins the title", q1Winner, q2Winner, editable, true)}`;
  champEl.innerHTML = champion ? `🏆 Champion: <span>${escapeHtml(champion.name)}</span>` : "";
}

function poCard(d, key, title, desc, teamA, teamB, editable, isFinal) {
  const cls = "pocard" + (isFinal ? " final" : "");
  if (!teamA || !teamB) {
    return `<div class="${cls}"><div class="potitle">${title}</div><div class="podesc">${desc}</div>
      <p class="pending">Waiting for previous results…</p></div>`;
  }
  return `<div class="${cls}"><div class="potitle">${title}</div><div class="podesc">${desc}</div>
    ${matchCard(d, teamA.name, teamB.name, d.playoff[key], ["playoff", key], editable)}</div>`;
}

function refocus(prev) {
  const next = document.querySelector(`input[data-path='${prev.dataset.path}']`);
  if (next) { next.focus(); const n = next.value.length; next.setSelectionRange(n, n); }
}

// ===== Tabs =====
function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(t => t.addEventListener("click", () => {
    tabs.forEach(x => x.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.hidden = true);
    t.classList.add("active");
    document.getElementById("panel-" + t.dataset.tab).hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
}
