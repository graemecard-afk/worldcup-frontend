import React from "react";
import KnockoutRound from "./KnockoutRound";

const RIGHT_LAYOUT = [
  {
    round: "Semi-final",
    matchNumbers: [102],
  },
  {
    round: "Quarter-final",
    matchNumbers: [99, 100],
  },
  {
    round: "Round of 16",
    matchNumbers: [91, 92, 95, 96],
  },
  {
    round: "Round of 32",
    matchNumbers: [76, 78, 79, 80, 86, 88, 85, 87],
  },
];

function getMatchNumber(match) {
  const raw = match.group_name ?? match.match_number ?? match.matchNumber ?? match.code ?? match.name ?? "";
  const found = String(raw).match(/\d+/);
  return found ? Number(found[0]) : null;
}

export default function KnockoutBracketRight({
  matches = [],
  predictions = {},
  theme = "dark",
  formatKickoff,
  isMatchLocked,
  handleScoreChange,
  savePrediction,
  StatusBadge,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(190px, 1fr))",
        gap: "14px",
        alignItems: "center",
      }}
    >
      {RIGHT_LAYOUT.map(group => {
        const groupMatches = group.matchNumbers
          .map(matchNumber =>
            matches.find(match => getMatchNumber(match) === matchNumber)
          )
          .filter(Boolean);

        return (
          <KnockoutRound
            key={group.round}
            round={group.round}
            matches={groupMatches}
            predictions={predictions}
            theme={theme}
            formatKickoff={formatKickoff}
            isMatchLocked={isMatchLocked}
            handleScoreChange={handleScoreChange}
            savePrediction={savePrediction}
            StatusBadge={StatusBadge}
          />
        );
      })}
    </div>
  );
}