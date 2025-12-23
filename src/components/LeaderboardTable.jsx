import React from "react";

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pickName(row) {
  return (
    row?.username ||
    row?.name ||
    row?.player ||
    row?.display_name ||
    row?.displayName ||
    "Player"
  );
}

function pickPoints(row) {
  // Common variants we've seen across apps/backends
  return (
    toNumber(row?.points_total) ||
    toNumber(row?.total_points) ||
    toNumber(row?.totalPoints) ||
    toNumber(row?.points) ||
    toNumber(row?.score) ||
    0
  );
}

function hasAny(rows, keyCandidates) {
  return rows.some(r => keyCandidates.some(k => r && r[k] != null));
}

function readFirstPresent(row, keyCandidates) {
  for (const k of keyCandidates) {
    if (row && row[k] != null) return row[k];
  }
  return null;
}

function computeRankedRows(rows) {
  const safeRows = Array.isArray(rows) ? rows.filter(Boolean) : [];

  // Sort by points DESC, then name ASC (stable-ish display)
  const sorted = [...safeRows].sort((a, b) => {
    const pa = pickPoints(a);
    const pb = pickPoints(b);
    if (pb !== pa) return pb - pa;
    const na = String(pickName(a)).toLowerCase();
    const nb = String(pickName(b)).toLowerCase();
    return na.localeCompare(nb);
  });

  // Competition ranking with ties (1,2,2,4...)
  let rank = 0;
  let index = 0;
  let lastPoints = null;

  return sorted.map(r => {
    index += 1;
    const pts = pickPoints(r);
    if (lastPoints === null || pts !== lastPoints) {
      rank = index;
      lastPoints = pts;
    }
    return { ...r, __rank: rank, __points: pts, __name: pickName(r) };
  });
}

export default function LeaderboardTable({ rows, theme }) {
  const ranked = computeRankedRows(rows);

  const isDark = String(theme || "").toLowerCase() === "dark";

  const tableStyle = {
    width: "100%",
    marginTop: 12,
    borderCollapse: "collapse",
    fontSize: 14,
  };

  const thStyle = {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`,
    opacity: 0.9,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "10px 8px",
    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    verticalAlign: "top",
  };

  const mono = { fontVariantNumeric: "tabular-nums" };

  // Optional columns (only show if any data exists)
  const showExact = hasAny(ranked, ["exact", "exact_hits", "exactHits"]);
  const showOutcome = hasAny(ranked, ["outcome", "outcome_hits", "outcomeHits"]);
  const showSpread = hasAny(ranked, ["spread", "spread_hits", "spreadHits"]);
  const showGoals = hasAny(ranked, ["goals", "goals_hits", "goalsHits"]);

  if (!ranked.length) {
    return <p style={{ opacity: 0.8, marginTop: 12 }}>No leaderboard data yet.</p>;
  }

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 60 }}>Rank</th>
            <th style={thStyle}>Player</th>
            <th style={{ ...thStyle, width: 90 }}>Points</th>
            {showExact && <th style={{ ...thStyle, width: 80 }}>Exact</th>}
            {showOutcome && <th style={{ ...thStyle, width: 90 }}>Outcome</th>}
            {showSpread && <th style={{ ...thStyle, width: 80 }}>Spread</th>}
            {showGoals && <th style={{ ...thStyle, width: 80 }}>Goals</th>}
          </tr>
        </thead>

        <tbody>
          {ranked.map((r, i) => {
            const zebraBg =
              i % 2 === 0
                ? "transparent"
                : isDark
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.03)";

            const exactVal = readFirstPresent(r, ["exact", "exact_hits", "exactHits"]);
            const outcomeVal = readFirstPresent(r, ["outcome", "outcome_hits", "outcomeHits"]);
            const spreadVal = readFirstPresent(r, ["spread", "spread_hits", "spreadHits"]);
            const goalsVal = readFirstPresent(r, ["goals", "goals_hits", "goalsHits"]);

            return (
              <tr key={r?.id ?? r?.user_id ?? r?.userId ?? i} style={{ background: zebraBg }}>
                <td style={{ ...tdStyle, ...mono }}>{r.__rank}</td>
                <td style={tdStyle}>{r.__name}</td>
                <td style={{ ...tdStyle, ...mono, fontWeight: 700 }}>{r.__points}</td>

                {showExact && <td style={{ ...tdStyle, ...mono }}>{exactVal ?? "-"}</td>}
                {showOutcome && <td style={{ ...tdStyle, ...mono }}>{outcomeVal ?? "-"}</td>}
                {showSpread && <td style={{ ...tdStyle, ...mono }}>{spreadVal ?? "-"}</td>}
                {showGoals && <td style={{ ...tdStyle, ...mono }}>{goalsVal ?? "-"}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
