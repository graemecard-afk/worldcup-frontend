import React from "react";

const ROUND_ORDER = [
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Final",
  "Third-place Play-off",
];

export default function KnockoutBracket({
  matches = [],
  predictions = {},
  theme = "dark",
  formatKickoff,
  isMatchLocked,
  handleScoreChange,
  savePrediction,
  StatusBadge,
}) {
  const matchesByRound = ROUND_ORDER.map(round => ({
    round,
    matches: matches.filter(m => m.stage === round),
  })).filter(group => group.matches.length > 0);

  return (
    <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${matchesByRound.length}, minmax(210px, 1fr))`,
          gap: "14px",
          minWidth: "1120px",
        }}
      >
        {matchesByRound.map(group => (
          <div key={group.round}>
            <h4 style={{ margin: "0 0 8px", fontSize: "0.85rem" }}>
              {group.round}
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {group.matches.map(m => {
                const pred = predictions[m.id] || {
                  home: "",
                  away: "",
                  status: "idle",
                };

                const locked = isMatchLocked ? isMatchLocked(m) : false;

                return (
                  <div
                    key={m.id}
                    style={{
                      borderRadius: "10px",
                      padding: "8px",
                      border:
                        theme === "dark"
                          ? "1px solid rgba(148,163,184,0.35)"
                          : "1px solid rgba(15,23,42,0.18)",
                      background:
                        theme === "dark"
                          ? "rgba(15,23,42,0.9)"
                          : "rgba(255,255,255,0.95)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.72rem",
                        opacity: 0.75,
                        marginBottom: "4px",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <span>{m.group_name}</span>
                      <span>{formatKickoff ? formatKickoff(m.kickoff_utc) : ""}</span>
                    </div>

                    <div style={{ fontWeight: 700 }}>{m.home_team}</div>
                    <div style={{ opacity: 0.7, fontSize: "0.75rem" }}>v</div>
                    <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                      {m.away_team}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "6px",
                      }}
                    >
                      <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                        Score:
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={pred.home}
                        disabled={locked}
                        onChange={e =>
                          handleScoreChange?.(m.id, "home", e.target.value)
                        }
                        onBlur={() => savePrediction?.(m)}
                        style={{
                          width: "42px",
                          padding: "4px 6px",
                          borderRadius: "6px",
                          border: "1px solid rgba(148,163,184,0.85)",
                          background: "rgba(15,23,42,0.95)",
                          color: "#e5e7eb",
                          textAlign: "center",
                          fontSize: "0.8rem",
                        }}
                      />

                      <span>:</span>

                      <input
                        type="number"
                        min="0"
                        value={pred.away}
                        disabled={locked}
                        onChange={e =>
                          handleScoreChange?.(m.id, "away", e.target.value)
                        }
                        onBlur={() => savePrediction?.(m)}
                        style={{
                          width: "42px",
                          padding: "4px 6px",
                          borderRadius: "6px",
                          border: "1px solid rgba(148,163,184,0.85)",
                          background: "rgba(15,23,42,0.95)",
                          color: "#e5e7eb",
                          textAlign: "center",
                          fontSize: "0.8rem",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Act:</span>
                        <span
                          style={{
                            width: "42px",
                            padding: "4px 6px",
                            borderRadius: "6px",
                            border: "1px solid rgba(148,163,184,0.85)",
                            background: "rgba(148,163,184,0.25)",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            textAlign: "center",
                          }}
                        >
                          {m.result_finalized ? (m.result_home_goals ?? "–") : "–"}
                        </span>
                        <span>:</span>
                        <span
                          style={{
                            width: "42px",
                            padding: "4px 6px",
                            borderRadius: "6px",
                            border: "1px solid rgba(148,163,184,0.85)",
                            background: "rgba(148,163,184,0.25)",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            textAlign: "center",
                          }}
                        >
                          {m.result_finalized ? (m.result_away_goals ?? "–") : "–"}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Pts:</span>
                        <span
                          style={{
                            width: "48px",
                            padding: "4px 6px",
                            borderRadius: "6px",
                            border: "1px solid rgba(148,163,184,0.85)",
                            background: "rgba(148,163,184,0.25)",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            textAlign: "center",
                          }}
                        >
                          {pred.points === 0 || typeof pred.points === "number"
                            ? pred.points
                            : "–"}
                        </span>
                      </div>
                    </div>
                    {StatusBadge && (
                      <StatusBadge
                        status={locked ? "locked" : pred.status}
                        theme={theme}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}