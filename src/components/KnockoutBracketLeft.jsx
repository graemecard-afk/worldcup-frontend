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
        position: "relative",
        gridTemplateColumns: "190px 230px 230px 190px",
        gap: "14px",
        alignItems: "start",
                  backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          padding: "10px",
      }}
    >
      {LEFT_LAYOUT.map(group => {
        const groupMatches = group.matchNumbers
          .map(matchNumber =>
            matches.find(match => getMatchNumber(match) === matchNumber)
          )
          .filter(Boolean);

                  const spacerTopByRound = {
            "Round of 32": 0,
            "Round of 16": 70,
            "Quarter-final": 175,
            "Semi-final": 385,
          };

          return (
                          <div
                key={group.round}
                style={{
                  paddingTop: spacerTopByRound[group.round],
paddingLeft:
  group.round === "Round of 16"
    ? "65px"
    : group.round === "Quarter-final"
    ? "40px"
    : 0,
                  borderLeft: "1px dashed rgba(255,255,255,0.25)",
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
                          M89: 60,
                          M90: 150,
                          M93: 160,
                          M94: 170,
                        }
                      : group.round === "Quarter-final"
                      ? {
                        M97: 200,  
                        M98: 515,
                        }
                                              : group.round === "Semi-final"
                        ? {
                            M101: 465,
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
              <div
          style={{
            position: "absolute",
            left: "205px",
            top: "155px",
            width: "38px",
            height: "3px",
            background: "rgba(34,197,94,0.85)",
            borderRadius: "2px",
            pointerEvents: "none",
          }}
        />
                <div
          style={{
            position: "absolute",
            left: "243px",
            top: "155px",
            width: "3px",
            height: "240px",
            background: "rgba(34,197,94,0.85)",
            borderRadius: "2px",
            pointerEvents: "none",
          }}
        />
                <div
          style={{
            position: "absolute",
            left: "205px",
            top: "395px",
            width: "38px",
            height: "3px",
            background: "rgba(34,197,94,0.85)",
            borderRadius: "2px",
            pointerEvents: "none",
          }}
        />
                <div
          style={{
            position: "absolute",
            left: "243px",
            top: "275px",
            width: "24px",
            height: "3px",
            background: "rgba(34,197,94,0.85)",
            borderRadius: "2px",
            pointerEvents: "none",
          }}
        />
                <div
          style={{
            position: "absolute",
            left: "267px",
            top: "269px",
            width: 0,
            height: 0,
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderLeft: "12px solid rgba(34,197,94,0.95)",
            pointerEvents: "none",
          }}
        />
    </div>
  );
}