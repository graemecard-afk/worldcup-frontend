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
  handleAdvancingChange,
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
    ? "90px"
    : group.round === "Semi-final"
    ? "120px"
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
                          M89: 55,
                          M90: 210,
                          M93: 365,
                          M94: 520,
                        }
                      : group.round === "Quarter-final"
                      ? {
                        M97: 190, 
                        M98: 700,
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
                handleAdvancingChange={handleAdvancingChange}
                savePrediction={savePrediction}
                StatusBadge={StatusBadge}
              />
            </div>
          );
      })}
                      {/* M74/M77 → M89 */}
        <div style={{ position: "absolute", left: "205px", top: "135px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "243px", top: "135px", width: "3px", height: "255px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "205px", top: "390px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "243px", top: "270px", width: "24px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "267px", top: "264px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "12px solid rgba(34,197,94,0.95)", pointerEvents: "none" }} />

        {/* M73/M75 → M90 */}
        <div style={{ position: "absolute", left: "205px", top: "625px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "243px", top: "625px", width: "3px", height: "240px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "205px", top: "865px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "243px", top: "750px", width: "24px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "267px", top: "744px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "12px solid rgba(34,197,94,0.95)", pointerEvents: "none" }} />

        {/* M83/M84 → M93 */}
        <div style={{ position: "absolute", left: "205px", top: "1105px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "243px", top: "1105px", width: "3px", height: "240px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "205px", top: "1345px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "243px", top: "1230px", width: "24px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "267px", top: "1224px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "12px solid rgba(34,197,94,0.95)", pointerEvents: "none" }} />

        {/* M81/M82 → M94 */}
        <div style={{ position: "absolute", left: "205px", top: "1575px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "243px", top: "1575px", width: "3px", height: "240px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "205px", top: "1815px", width: "38px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "243px", top: "1710px", width: "24px", height: "3px", background: "rgba(34,197,94,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "267px", top: "1704px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "12px solid rgba(34,197,94,0.95)", pointerEvents: "none" }} />

        {/* M89/M90 → M97 */}
        <div style={{ position: "absolute", left: "475px", top: "270px", width: "38px", height: "3px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "513px", top: "270px", width: "3px", height: "460px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "475px", top: "730px", width: "38px", height: "3px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "513px", top: "510px", width: "24px", height: "3px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "537px", top: "504px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "12px solid rgba(234,179,8,0.95)", pointerEvents: "none" }} />

        {/* M93/M94 → M98 */}
        <div style={{ position: "absolute", left: "475px", top: "1240px", width: "38px", height: "3px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "513px", top: "1240px", width: "3px", height: "440px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "475px", top: "1680px", width: "38px", height: "3px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "513px", top: "1465px", width: "24px", height: "3px", background: "rgba(234,179,8,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "537px", top: "1460px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "12px solid rgba(234,179,8,0.95)", pointerEvents: "none" }} />

        {/* M97/M98 → M101 */}
        <div style={{ position: "absolute", left: "750px", top: "510px", width: "38px", height: "3px", background: "rgba(239,68,68,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "788px", top: "510px", width: "3px", height: "945px", background: "rgba(239,68,68,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "750px", top: "1455px", width: "38px", height: "3px", background: "rgba(239,68,68,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "788px", top: "990px", width: "24px", height: "3px", background: "rgba(239,68,68,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "812px", top: "984px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "12px solid rgba(239,68,68,0.95)", pointerEvents: "none" }} />

        {/* M101 → M104 */}
        <div style={{ position: "absolute", left: "1015px", top: "990px", width: "24px", height: "3px", background: "rgba(59,130,246,0.85)", borderRadius: "2px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "1039px", top: "984px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "12px solid rgba(59,130,246,0.95)", pointerEvents: "none" }} />
    </div>
  );
}