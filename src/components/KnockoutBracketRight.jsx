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
  const raw =
    match.group_name ??
    match.match_number ??
    match.matchNumber ??
    match.code ??
    match.name ??
    "";
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
        position: "relative",
        gridTemplateColumns: "190px 230px 230px 190px",
        gap: "14px",
        alignItems: "start",
        paddingLeft: "90px",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
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
  group.round === "Round of 32"
    ? {
        M76: 50,
        M86: -10,
      }
    : group.round === "Round of 16"
    ? {
        M91: 80,
        M92: 150,
        M95: 125,
        M96: 140,
      }
    : group.round === "Quarter-final"
    ? {
        M99: 215,
        M100: 475,
      }
    : group.round === "Semi-final"
    ? {
        M102: 465,
      }
    : {}
}
              labelOffsetY={
  group.round === "Semi-final"
    ? 460
    : group.round === "Quarter-final"
    ? 175
    : 0
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
          right: "885px",
          top: "975px",
          width: "24px",
          height: "3px",
          background: "rgba(59,130,246,0.85)",
          borderRadius: "2px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "909px",
          top: "969px",
          width: 0,
          height: 0,
          borderTop: "7px solid transparent",
          borderBottom: "7px solid transparent",
          borderRight: "12px solid rgba(59,130,246,0.95)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}