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
          alignItems: "start",
        }}
      >
        {RIGHT_LAYOUT.map(group => {
          const groupMatches = group.matchNumbers
            .map(matchNumber =>
              matches.find(match => getMatchNumber(match) === matchNumber)
            )
            .filter(Boolean);

          const spacerTopByRound = {
            "Semi-final": 385,
            "Quarter-final": 175,
            "Round of 16": 70,
            "Round of 32": 0,
          };

          return (
            <div
              key={group.round}
              style={{
                paddingTop: spacerTopByRound[group.round],
              }}
            >
              <KnockoutRound
                cardGap={
                  group.round === "Round of 32"
                    ? 10
                    : group.round === "Round of 16"
                    ? 95
                    : group.round === "Quarter-final"
                    ? 220
                    : 10
                }
                matchSpacing={
                  group.round === "Round of 16"
                    ? {
                        M91: 60,
                        M92: 150,
                        M95: 160,
                        M96: 170,
                      }
                    : group.round === "Quarter-final"
                    ? {
                        M99: 195,
                        M100: 515,
                      }
                    : group.round === "Semi-final"
                    ? {
                        M102: 465,
                      }
                    : {}
                }
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