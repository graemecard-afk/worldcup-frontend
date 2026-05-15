import React from "react";
import KnockoutMatchCard from "./KnockoutMatchCard";

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
                  <KnockoutMatchCard
                    key={m.id}
                    match={m}
                    pred={pred}
                    locked={locked}
                    theme={theme}
                    formatKickoff={formatKickoff}
                    handleScoreChange={handleScoreChange}
                    savePrediction={savePrediction}
                    StatusBadge={StatusBadge}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}