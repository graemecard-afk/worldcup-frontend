import React from "react";
import KnockoutRound from "./KnockoutRound";

const CENTER_LAYOUT = [
  {
    round: "Final",
    matchNumbers: [104],
  },
  {
    round: "Third-place Play-off",
    matchNumbers: [103],
  },
];

function getMatchNumber(match) {
  const raw = match.group_name ?? match.match_number ?? match.matchNumber ?? match.code ?? match.name ?? "";
  const found = String(raw).match(/\d+/);
  return found ? Number(found[0]) : null;
}

export default function KnockoutBracketCenter({
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
        gap: "18px",
        alignItems: "center",
        paddingLeft: "120px",
      }}
    >
      {CENTER_LAYOUT.map(group => {
        const groupMatches = group.matchNumbers
          .map(matchNumber =>
            matches.find(match => getMatchNumber(match) === matchNumber)
          )
          .filter(Boolean);

                  const spacerTopByRound = {
            Final: 280,
            "Third-place Play-off": 0,
          };

          return (
            <div key={group.round} style={{ paddingTop: spacerTopByRound[group.round] }}>
              <KnockoutRound
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
            </div>
          );
      })}
    </div>
  );
}