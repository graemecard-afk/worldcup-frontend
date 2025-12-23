import React from "react";

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pickFirst(row, keys, fallback = null) {
  for (const k of keys) {
    if (row && row[k] != null) return row[k];
  }
  return fallback;
}

function pickName(row) {
  // Prefer your existing computed field
  return (
    pickFirst(row, ["_name", "username", "name", "player", "display_name", "displayName"]) ||
    "Player"
  );
}

function pickGroupStagePoints(row) {
  // Prefer your existing computed field
  const v = pickFirst(row, [
    "_groupStagePoints",
    "group_stage_points",
    "groupStagePoints",
    "gs_points",
    "group_points",
    "groupPoints",
    "points_group_stage",
  ], 0);
  return toNumber(v);
}

function pickKnockoutPoints(row) {
  // Prefer your existing computed field
  const v = pickFirst(row, [
    "_knockoutPoints",
    "knockout_points",
    "knockoutPoints",
    "ko_points",
    "knockouts_points",
    "points_knockouts",
  ], 0);
  return toNumber(v);
}

function pickGrandTotal(row) {
  // Prefer your existing computed field
  const v = pickFirst(row, [
    "_grandTotal",
    "grand_total",
    "grandTotal",
    "total_points",
    "totalPoints",
    "points_total",
    "points",
    "score",
  ]);
  if (v != null) return toNumber(v);
  return pickGroupStagePoints(row) + pickKnockoutPoints(row);
}

function pickRankGroupStage(row) {
  const v = pickFirst(row, [
    "_rankGroupStage",
    "rank_gs",
    "gs_rank",
    "group_stage_rank",
    "groupStageRank",
  ]);
  return v == null ? null : toNumber(v);
}

function pickOverallRank(row) {
  const v = pickFirst(row, [
    "_overallRank",
    "overall_rank",
    "overallRank",
    "rank_overall",
    "rank",
  ]);
  return v == null ? null : toNumber(v);
}

function computeRankBy(rows, valueFn) {
  // Competition ranking with ties (1,2,2,4...)
  const sorted = [...rows].sort((a, b) => valueFn(b) - valueFn(a));
  const ranksByKey = new Map();

  let rank = 0;
  let index = 0;
  let lastVal = null;

  for (const r of sorted) {
    index += 1;
    const v = valueFn(r);
    if (lastVal === null || v !== lastVal) {
      rank = index;
      lastVal = v;
    }
    ranksByKey.set(r.__key, rank);
  }
  return ranksByKey;
}

export default function LeaderboardTable({ rows = [], theme = "dark" }) {
  const isDark = String(theme).toLowerCase() === "dark";
  const safe = Array.isArray(rows) ? rows.filter(Boolean) : [];

  // Normalize but KEEP your precomputed fields
  const normalized = safe.map((r, i) => {
    const key = String(r?.user_id ?? r?.userId ?? r?.id ?? r?._name ?? r?.username ?? i);

    const name = pickName(r);
    const gs = pickGroupStagePoints(r);
    const ko = pickKnockoutPoints(r);
    const total = pickGrandTotal(r);

    const rankGSProvided = pickRankGroupStage(r);
    const rankOverallProvided = pickOverallRank(r);

    return {
      ...r,
      __key: key,
      __name: name,
      __gs: gs,
      __ko: ko,
      __total: total,
      __rankGSProvided: rankGSProvided,
      __rankOverallProvided: rankOverallProvided,
    };
  });

  // Compute ranks only as fallback
  const gsRanks = computeRankBy(normalized, r => r.__gs);
  const overallRanks = computeRankBy(normalized, r => r.__total);

  // Display order: use provided overall rank if present; otherwise computed
  const display = [...normalized].sort((a, b) => {
    const ra = a.__rankOverallProvided ?? overallRanks.get(a.__key) ?? 999999;
    const rb = b.__rankOverallProvided ?? overallRanks.get(b.__key) ?? 999999;
    if (ra !== rb) return ra - rb;
    if (b.__total !== a.__total) return b.__total - a.__total;
    return String(a.__name).localeCompare(String(b.__name));
  });

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.9rem",
    marginTop: 12,
  };

  const thBase = {
    opacity: 0.85,
    padding: "6px 6px",
    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`,
    whiteSpace: "nowrap",
  };

  const tdBase = {
    padding: "8px 6px",
    borderTop: isDark
      ? "1px solid rgba(148,163,184,0.25)"
      : "1px solid rgba(15,23,42,0.12)",
    verticalAlign: "top",
  };

  const mono = { fontVariantNumeric: "tabular-nums" };

  if (!display.length) {
    return <p style={{ opacity: 0.8, marginTop: 12 }}>No leaderboard data yet.</p>;
  }

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr style={{ opacity: 0.85 }}>
            <th style={{ ...thBase, textAlign: "left", width: 90 }}>Rank (GS)</th>
            <th style={{ ...thBase, textAlign: "left" }}>Name</th>
            <th style={{ ...thBase, textAlign: "right", width: 140 }}>Group Stage</th>
            <th style={{ ...thBase, textAlign: "right", width: 120 }}>Knockouts</th>
            <th style={{ ...thBase, textAlign: "right", width: 130 }}>Grand Total</th>
            <th style={{ ...thBase, textAlign: "right", width: 120 }}>Overall Rank</th>
          </tr>
        </thead>

        <tbody>
          {display.map((r, idx) => {
            const rankGS = r.__rankGSProvided ?? gsRanks.get(r.__key);
            const rankOverall = r.__rankOverallProvided ?? overallRanks.get(r.__key);

            return (
              <tr key={r.user_id || `${r.__name}-${idx}`}>
                <td style={{ ...tdBase, textAlign: "left", ...mono }}>{rankGS}</td>
                <td style={{ ...tdBase, textAlign: "left" }}>{r.__name}</td>
                <td style={{ ...tdBase, textAlign: "right", fontWeight: 700, ...mono }}>
                  {r.__gs}
                </td>
                <td style={{ ...tdBase, textAlign: "right", ...mono }}>{r.__ko}</td>
                <td style={{ ...tdBase, textAlign: "right", fontWeight: 700, ...mono }}>
                  {r.__total}
                </td>
                <td style={{ ...tdBase, textAlign: "right", opacity: 0.7, ...mono }}>
                  {rankOverall}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
