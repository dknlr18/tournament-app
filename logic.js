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

function standings(d, g) {
  const rows = [0, 1, 2].map(li => ({
    li, gi: groupTeamIndex(g, li), name: playerName(d, groupTeamIndex(g, li)),
    pld: 0, pts: 0, sf: 0, sa: 0,
  }));
  d.group[g].forEach((m, mi) => {
    const a = num(m.a), b = num(m.b);
    if (a === null || b === null) return;
    const [la, lb] = PAIRS[mi];
    const ra = rows.find(r => r.li === la), rb = rows.find(r => r.li === lb);
    ra.pld++; rb.pld++; ra.sf += a; ra.sa += b; rb.sf += b; rb.sa += a;
    if (a > b) ra.pts += 2; else if (b > a) rb.pts += 2; else { ra.pts++; rb.pts++; }
  });
  rows.forEach(r => r.diff = r.sf - r.sa);
  // Rank by points, then by total points scored.
  rows.sort((x, y) => y.pts - x.pts || y.sf - x.sf);
  return rows;
}
function groupComplete(d, g) {
  return d.group[g].every(m => num(m.a) !== null && num(m.b) !== null);
}
function seeds(d) {
  if (!GROUPS.every(g => groupComplete(d, g))) return null;
  const winners = GROUPS.map(g => ({ g, ...standings(d, g)[0] }));
  // Seed by points, then by total points scored.
  winners.sort((x, y) => y.pts - x.pts || y.sf - x.sf);
  return winners;
}
function matchWinner(m) {
  const a = num(m.a), b = num(m.b);
  if (a === null || b === null || a === b) return null;
  return a > b ? "a" : "b";
}

// Render the whole tournament into the page.
// opts = { editable: bool, onChange: (path, value) => void }
//   path is e.g. ["group","A",0,"a"] or ["playoff","q1","b"]
function renderTournament(d, opts) {
  const editable = !!(opts && opts.editable);
  const onChange = opts && opts.onChange;

  renderGroups(d, editable);
  renderSeeds(d);
  renderPlayoffs(d, editable);

  if (editable && onChange) {
    document.querySelectorAll("input[type=number][data-path]").forEach(inp => {
      inp.addEventListener("input", e => {
        onChange(JSON.parse(e.target.dataset.path), e.target.value);
        refocus(e.target);
      });
    });
  }
}

function scoreCell(path, value, editable) {
  if (editable) {
    return `<input type="number" min="0" data-path='${JSON.stringify(path)}' value="${value}" />`;
  }
  return `<span class="score">${value === "" ? "–" : escapeHtml(String(value))}</span>`;
}

function matchRow(d, nameA, nameB, m, path, editable) {
  const w = matchWinner(m);
  return `<div class="match">
    <span class="t ${w === 'a' ? 'winnerTag' : ''}">${escapeHtml(nameA)}</span>
    ${scoreCell([...path, "a"], m.a, editable)}
    <span class="vs">v</span>
    ${scoreCell([...path, "b"], m.b, editable)}
    <span class="t right ${w === 'b' ? 'winnerTag' : ''}">${escapeHtml(nameB)}</span>
  </div>`;
}

function renderGroups(d, editable) {
  document.getElementById("groups").innerHTML = GROUPS.map(g => {
    const matches = PAIRS.map((p, mi) =>
      matchRow(d, playerName(d, groupTeamIndex(g, p[0])), playerName(d, groupTeamIndex(g, p[1])),
        d.group[g][mi], ["group", g, mi], editable)).join("");
    const rows = standings(d, g);
    const done = groupComplete(d, g);
    const table = `<table>
      <tr><th class="name" style="text-align:left">Player</th><th title="Played">P</th><th title="Points">Pts</th><th title="Points scored (tiebreaker)">PF</th></tr>
      ${rows.map((r, i) => `<tr class="${i === 0 && done ? 'leader' : ''}">
        <td class="name">${escapeHtml(r.name)}${i === 0 && done ? ' 🥇' : ''}</td>
        <td>${r.pld}</td><td>${r.pts}</td><td>${r.sf}</td></tr>`).join("")}
    </table>`;
    return `<div class="group"><h3>Group ${g}</h3>${matches}${table}</div>`;
  }).join("");
}

function renderSeeds(d) {
  const el = document.getElementById("seeds");
  const status = document.getElementById("seedStatus");
  const sd = seeds(d);
  if (!sd) {
    status.textContent = "— complete all 9 group matches to lock seeds";
    el.innerHTML = `<p class="pending">Group winners are seeded here once every group match has a score.</p>`;
    return;
  }
  status.textContent = "";
  el.innerHTML = sd.map((w, i) => `
    <div class="seedline"><span class="s">Seed ${i + 1}</span>
      <span>${escapeHtml(w.name)} <span style="color:var(--muted)">(Group ${w.g} winner · ${w.pts} pts)</span></span>
    </div>`).join("");
}

function renderPlayoffs(d, editable) {
  const el = document.getElementById("playoffs");
  const champEl = document.getElementById("champion");
  const sd = seeds(d);
  if (!sd) {
    el.innerHTML = `<p class="pending">Playoffs unlock once seeding is complete.</p>`;
    champEl.textContent = "";
    return;
  }
  const [s1, s2, s3] = sd;
  const q1 = d.playoff.q1, q1w = matchWinner(q1);
  const q1Winner = q1w === "a" ? s1 : q1w === "b" ? s2 : null;
  const q1Loser = q1w === "a" ? s2 : q1w === "b" ? s1 : null;
  const q2 = d.playoff.q2, q2w = matchWinner(q2);
  const q2Winner = q2w === "a" ? q1Loser : q2w === "b" ? s3 : null;
  const fin = d.playoff.final, finw = matchWinner(fin);
  const champion = finw === "a" ? q1Winner : finw === "b" ? q2Winner : null;

  el.innerHTML = `
    ${poCard(d, "q1", "Q1", "Seed 1 v Seed 2 · winner → Q3, loser drops to Q2", s1, s2, q1, editable)}
    ${poCard(d, "q2", "Q2", "Loser of Q1 v Seed 3 · loser is eliminated", q1Loser, s3, q2, editable)}
    ${poCard(d, "final", "Q3 (Final)", "Winner of Q1 v Winner of Q2 · wins the title", q1Winner, q2Winner, fin, editable, true)}`;
  champEl.textContent = champion ? `🏆 Champion: ${champion.name}` : "";
}

function poCard(d, key, title, desc, teamA, teamB, m, editable, isFinal) {
  const cls = "po" + (isFinal ? " final" : "");
  if (!teamA || !teamB) {
    return `<div class="${cls}"><h4>${title}</h4><div class="desc">${desc}</div>
      <p class="pending">Waiting for previous results…</p></div>`;
  }
  return `<div class="${cls}"><h4>${title}</h4><div class="desc">${desc}</div>
    ${matchRow(d, teamA.name, teamB.name, m, ["playoff", key], editable)}</div>`;
}

function refocus(prev) {
  const next = document.querySelector(`input[data-path='${prev.dataset.path}']`);
  if (next) { next.focus(); const n = next.value.length; next.setSelectionRange(n, n); }
}
