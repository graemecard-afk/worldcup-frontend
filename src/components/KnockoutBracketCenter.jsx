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
  propagatedTeams = {},
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
        gap: "18px",
        alignItems: "center",
        paddingLeft: "135px",
      }}
    >
      {CENTER_LAYOUT.map(group => {
        const groupMatches = group.matchNumbers
          .map(matchNumber =>
            matches.find(match => getMatchNumber(match) === matchNumber)
          )
          .filter(Boolean);

                  const spacerTopByRound = {
            Final: 1095,
            "Third-place Play-off": 0,
          };

          return (
            <div key={group.round} style={{ paddingTop: spacerTopByRound[group.round] }}>
  {group.round === "Final" && groupMatches[0] && (
    <div
      style={{
        marginBottom: "10px",
        padding: "8px",
        width: "190px",
        borderRadius: "10px",
        border: "1px solid rgba(59,130,246,0.55)",
        background: "rgba(15,23,42,0.9)",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: "0.75rem", opacity: 0.8, marginBottom: "6px" }}>
        Champion:
      </div>

      <select
        value={predictions[groupMatches[0].id]?.champion || ""}
        disabled={isMatchLocked ? isMatchLocked(groupMatches[0]) : false}
        onChange={e =>
          handleScoreChange?.(groupMatches[0].id, "champion", e.target.value)
        }
        onBlur={() => savePrediction?.(groupMatches[0])}
        style={{
          width: "100%",
          padding: "6px",
          borderRadius: "6px",
          border: "1px solid rgba(148,163,184,0.85)",
          background: "rgba(15,23,42,0.95)",
          color: "#e5e7eb",
          fontSize: "0.8rem",
        }}
      >
        <option value="">Select champion</option>
        <option value={groupMatches[0].home_team}>{groupMatches[0].home_team}</option>
        <option value={groupMatches[0].away_team}>{groupMatches[0].away_team}</option>
      </select>
    </div>
  )}
  
              <KnockoutRound
                round={group.round}
                matches={groupMatches}
                predictions={predictions}
                propagatedTeams={propagatedTeams}
                theme={theme}
                formatKickoff={formatKickoff}
                isMatchLocked={isMatchLocked}
                handleScoreChange={handleScoreChange}
                handleAdvancingChange={handleAdvancingChange}
                savePrediction={savePrediction}
                StatusBadge={StatusBadge}
              />
                  {group.round === "Third-place Play-off" && groupMatches[0] && (
      <div
        style={{
          marginTop: "10px",
          padding: "8px",
          width: "190px",
          borderRadius: "10px",
          border: "1px solid rgba(59,130,246,0.55)",
          background: "rgba(15,23,42,0.9)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: "0.75rem", opacity: 0.8, marginBottom: "6px" }}>
          Third place:
        </div>

        <select
          value={predictions[groupMatches[0].id]?.thirdPlace || ""}
          disabled={isMatchLocked ? isMatchLocked(groupMatches[0]) : false}
          onChange={e =>
            handleScoreChange?.(groupMatches[0].id, "thirdPlace", e.target.value)
          }
          onBlur={() => savePrediction?.(groupMatches[0])}
          style={{
            width: "100%",
            padding: "6px",
            borderRadius: "6px",
            border: "1px solid rgba(148,163,184,0.85)",
            background: "rgba(15,23,42,0.95)",
            color: "#e5e7eb",
            fontSize: "0.8rem",
          }}
        >
          <option value="">Select third place</option>
          <option value={groupMatches[0].home_team}>{groupMatches[0].home_team}</option>
          <option value={groupMatches[0].away_team}>{groupMatches[0].away_team}</option>
        </select>
      </div>
    )}
            </div>
          );
      })}
    </div>
  );
}