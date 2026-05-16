import React from "react";
import KnockoutRound from "./KnockoutRound";

const LEFT_LAYOUT = [
  {
    round: "Round of 32",
    matchNumbers: [74, 77, 73, 75, 83, 84, 81, 82],
  },
  {
    round: "Round of 16",
    matchNumbers: [89, 90, 93, 94],
  },
  {
    round: "Quarter-final",
    matchNumbers: [97, 98],
  },
  {
    round: "Semi-final",
    matchNumbers: [101],
  },
];

function getMatchNumber(match) {
  const raw = match.group_name ?? match.match_number ?? match.matchNumber ?? match.code ?? match.name ?? "";
  const found = String(raw).match(/\d+/);
  return found ? Number(found[0]) : null;
}

export default function KnockoutBracketLeft({
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
      {LEFT_LAYOUT.map(group => {
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