import React from "react";

export default function LeaderboardTable({ rows = [], theme = "dark" }) {
  const isDark = String(theme).toLowerCase() === "dark";

  // 1) Normalise + compute columns (match App.jsx logic exactly)
  const normalised = (rows || []).map(r => {
    const name = r?.name || r?.username || "—";
    const groupStagePoints = Number(r?.total_points ?? 0);
    const knockoutPoints = 0; // placeholder (matches your App.jsx)
    const grandTotal = groupStagePoints + knockoutPoints;

    return {
      ...r,
      _name: name,
      _groupStagePoints: groupStagePoints,
      _knockoutPoints: knockoutPoints,
      _grandTotal: grandTotal,
    };
  });

  // 2) Sort once (Group Stage desc, then name asc)
  normalised.sort((a, b) => {
    if (b._groupStagePoints !== a._groupStagePoints)
      return b._groupStagePoints - a._groupStagePoints;
    return String(a._name).localeCompare(String(b._name));
  });

  // 3) Rank once (competition ranking: 1,2,2,4 when ties)
  let lastPoints = null;
  let currentRank = 0;

  const ranked = normalised.map((r, idx) => {
    if (lastPoints === null || r._groupStagePoints !== lastPoints) {
      currentRank = idx + 1;
      lastPoints = r._groupStagePoints;
    }
    return {
      ...r,
      _rankGroupStage: currentRank,
      _overallRank: "", // placeholder for later (matches your App.jsx)
    };
  });

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.9rem",
    marginTop: 12,
  };

  const thStyle = {
    textAlign: "left",
    padding: "6px 6px",
    opacity: 0.85,
    borderBottom: isDark
      ? "1px solid rgba(148,163,184,0.25)"
      : "1px solid rgba(15,23,42,0.12)",
    whiteSpace: "nowrap",
  };

  const tdBase = {
    padding: "8px 6px",
    borderTop: isDark
      ? "1px solid rgba(148,163,184,0.25)"
      : "1px solid rgba(15,23,42,0.12)",
  };

  if (!ranked.length) {
    return <p style={{ opacity: 0.8, marginTop: 12 }}>No leaderboard data yet.</p>;
  }

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr style={{ opacity: 0.85 }}>
            <th style={{ ...thStyle, width: 90 }}>Rank (GS)</th>
            <th style={thStyle}>Name</th>
            <th style={{ ...thStyle, textAlign: "right", width: 140 }}>Group Stage</th>
            <th style={{ ...thStyle, textAlign: "right", width: 120 }}>Knockouts</th>
            <th style={{ ...thStyle, textAlign: "right", width: 130 }}>Grand Total</th>
            <th style={{ ...thStyle, textAlign: "right", width: 120 }}>Overall Rank</th>
          </tr>
        </thead>

        <tbody>
          {ranked.map((r, idx) => (
            <tr key={r.user_id || `${r._name}-${idx}`}>
              <td style={tdBase}>{r._rankGroupStage}</td>
              <td style={tdBase}>{r._name}</td>
              <td style={{ ...tdBase, textAlign: "right", fontWeight: 700 }}>
                {r._groupStagePoints}
              </td>
              <td style={{ ...tdBase, textAlign: "right" }}>{r._knockoutPoints}</td>
              <td style={{ ...tdBase, textAlign: "right", fontWeight: 700 }}>{r._grandTotal}</td>
              <td style={{ ...tdBase, textAlign: "right", opacity: 0.7 }}>{r._overallRank}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
