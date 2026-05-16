import React from "react";
import KnockoutRound from "./KnockoutRound";

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
          <KnockoutRound
            key={group.round}
            round={group.round}
            matches={group.matches}
            predictions={predictions}
            theme={theme}
            formatKickoff={formatKickoff}
            isMatchLocked={isMatchLocked}
            handleScoreChange={handleScoreChange}
            savePrediction={savePrediction}
            StatusBadge={StatusBadge}
          />
        ))}
      </div>
    </div>
  );
}