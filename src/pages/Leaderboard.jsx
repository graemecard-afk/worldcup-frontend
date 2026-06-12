import React, { useState } from "react";

export default function LeaderboardTable({ rows = [], theme = "dark" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const isDark = String(theme).toLowerCase() === "dark";

  // 1) Normalise + compute columns
  const normalised = (rows || []).map(r => {
    const name = r?.name || r?.username || "—";
    const email = r?.email || "";
    const groupStagePoints = Number(r?.group_stage_points ?? 0);
    const knockoutPoints = Number(r?.knockout_points ?? 0);
    const grandTotal = Number(r?.total_points ?? groupStagePoints + knockoutPoints);

    return {
      ...r,
      _name: name,
      _email: email,
      _groupStagePoints: groupStagePoints,
      _knockoutPoints: knockoutPoints,
      _grandTotal: grandTotal,
    };
  });

  // 2) Sort by Grand Total desc, then Group Stage desc, then name asc
  normalised.sort((a, b) => {
    if (b._grandTotal !== a._grandTotal)
      return b._grandTotal - a._grandTotal;

    if (b._groupStagePoints !== a._groupStagePoints)
      return b._groupStagePoints - a._groupStagePoints;

    return String(a._name).localeCompare(String(b._name));
  });

  // 3) Rank by Grand Total (competition ranking: 1,2,2,4 when ties)
  let lastPoints = null;
  let currentRank = 0;

  const ranked = normalised.map((r, idx) => {
    if (lastPoints === null || r._grandTotal !== lastPoints) {
      currentRank = idx + 1;
      lastPoints = r._grandTotal;
    }

    return {
      ...r,
      _overallRank: currentRank,
    };
  });

  const search = searchTerm.trim().toLowerCase();

  const filtered = search
    ? ranked.filter(r =>
        String(r._name).toLowerCase().includes(search)
      )
    : ranked;

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
    <div style={{ width: "100%" }}>
      <div style={{ marginTop: 8, marginBottom: 12 }}>
        <input
          type="search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Find family and friends"
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "9px 11px",
            borderRadius: 10,
            border: isDark
              ? "1px solid rgba(148,163,184,0.45)"
              : "1px solid rgba(15,23,42,0.2)",
          }}
        />

        {search ? (
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            Showing {filtered.length} of {ranked.length} players
          </div>
        ) : null}
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ opacity: 0.85 }}>
              <th style={{ ...thStyle, width: 90 }}>Rank</th>
              <th style={thStyle}>Name</th>
              <th style={{ ...thStyle, textAlign: "right", width: 140 }}>Group Stage</th>
              <th style={{ ...thStyle, textAlign: "right", width: 120 }}>Knockouts</th>
              <th style={{ ...thStyle, textAlign: "right", width: 130 }}>Grand Total</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r, idx) => (
              <tr key={r.user_id || `${r._name}-${idx}`}>
                <td style={tdBase}>{r._overallRank}</td>
                <td style={tdBase}>{r._name}</td>
                <td style={{ ...tdBase, textAlign: "right", fontWeight: 700 }}>
                  {r._groupStagePoints}
                </td>
                <td style={{ ...tdBase, textAlign: "right" }}>{r._knockoutPoints}</td>
                <td style={{ ...tdBase, textAlign: "right", fontWeight: 700 }}>
                  {r._grandTotal}
                </td>
              </tr>
            ))}

            {!filtered.length && (
              <tr>
                <td colSpan={5} style={{ ...tdBase, opacity: 0.75 }}>
                  No players match that search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
