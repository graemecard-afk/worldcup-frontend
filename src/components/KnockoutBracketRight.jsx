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
  handleAdvancingChange,
  savePrediction,
  StatusBadge,
}) {
  return (
    <div
      style={{
        display: "grid",
        position: "relative",
        gridTemplateColumns: "170px 260px 260px 190px",
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
      transform:
        group.round === "Semi-final"
          ? "translateX(-80px)"
          : "none",
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
        M76: 0,
        M86: 0,
      }
    : group.round === "Round of 16"
    ? {
        M91: 55,
        M92: 210,
        M95: 365,
        M96: 520,
      }
    : group.round === "Quarter-final"
    ? {
        M99: 190,
        M100: 700,
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
              handleAdvancingChange={handleAdvancingChange}
              savePrediction={savePrediction}
              StatusBadge={StatusBadge}
            />
          </div>
        );
      })}
        {/* M76/M78 → M91 */}
        <div style={{ position: "absolute", right: "195px", top: "135px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "233px", top: "135px", width: "3px", height: "255px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "195px", top: "390px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "233px", top: "270px", width: "24px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "257px", top: "264px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: "12px solid rgba(34,197,94,0.95)", pointerEvents: "none" }} />

        {/* M79/M80 → M92 */}
        <div style={{ position: "absolute", right: "195px", top: "625px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "233px", top: "625px", width: "3px", height: "240px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "195px", top: "865px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "233px", top: "750px", width: "24px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "257px", top: "744px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: "12px solid rgba(34,197,94,0.95)", pointerEvents: "none" }} />

        {/* M86/M88 → M95 */}
        <div style={{ position: "absolute", right: "195px", top: "1105px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "233px", top: "1105px", width: "3px", height: "240px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "195px", top: "1345px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "233px", top: "1230px", width: "24px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "257px", top: "1224px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: "12px solid rgba(34,197,94,0.95)", pointerEvents: "none" }} />

        {/* M85/M87 → M96 */}
        <div style={{ position: "absolute", right: "195px", top: "1575px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "233px", top: "1575px", width: "3px", height: "240px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "195px", top: "1815px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "233px", top: "1710px", width: "24px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "257px", top: "1704px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: "12px solid rgba(34,197,94,0.95)", pointerEvents: "none" }} />

        {/* M91/M92 → M99 */}
        <div style={{ position: "absolute", right: "465px", top: "270px", width: "38px", height: "3px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "503px", top: "270px", width: "3px", height: "460px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "465px", top: "730px", width: "38px", height: "3px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "503px", top: "510px", width: "24px", height: "3px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "527px", top: "504px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: "12px solid rgba(234,179,8,0.95)", pointerEvents: "none" }} />

        {/* M95/M96 → M100 */}
        <div style={{ position: "absolute", right: "465px", top: "1240px", width: "38px", height: "3px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "503px", top: "1240px", width: "3px", height: "440px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "465px", top: "1680px", width: "38px", height: "3px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "503px", top: "1465px", width: "24px", height: "3px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "527px", top: "1460px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: "12px solid rgba(234,179,8,0.95)", pointerEvents: "none" }} />

        {/* M99/M100 → M102 */}
        <div style={{ position: "absolute", right: "740px", top: "510px", width: "38px", height: "3px", background: "rgba(239,68,68,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "778px", top: "510px", width: "3px", height: "945px", background: "rgba(239,68,68,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "740px", top: "1455px", width: "38px", height: "3px", background: "rgba(239,68,68,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "778px", top: "990px", width: "24px", height: "3px", background: "rgba(239,68,68,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "802px", top: "984px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: "12px solid rgba(239,68,68,0.95)", pointerEvents: "none" }} />
      <div
        style={{
          position: "absolute",
          right: "1005px",
          top: "985px",
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
          right: "1029px",
          top: "980px",
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