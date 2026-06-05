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
  actualPropagatedTeams = {},
  actualWinnersByMatchNumber = {},
  theme = "dark",
  formatKickoff,
  isMatchLocked,
  handleScoreChange,
  handleAdvancingChange,
  savePrediction,
  StatusBadge,
}) {
  const finalMatch = matches.find(m => getMatchNumber(m) === 104);
const finalTeams = finalMatch ? propagatedTeams[104] : null;
const finalHomeTeam = finalTeams?.homeTeam || finalMatch?.home_team || "";
const finalAwayTeam = finalTeams?.awayTeam || finalMatch?.away_team || "";
const finalPrediction = finalMatch ? predictions[finalMatch.id] || {} : {};
const finalHomeGoals = parseInt(finalPrediction.home, 10);
const finalAwayGoals = parseInt(finalPrediction.away, 10);
const finalHasScore =
  !Number.isNaN(finalHomeGoals) && !Number.isNaN(finalAwayGoals);
const finalIsDraw = finalHasScore && finalHomeGoals === finalAwayGoals;
const finalClearWinner =
  finalHasScore && !finalIsDraw
    ? finalHomeGoals > finalAwayGoals
      ? finalHomeTeam
      : finalAwayTeam
    : "";
const championValue =
  finalClearWinner || finalPrediction.advancing || "";
   const thirdPlaceMatch = matches.find(m => getMatchNumber(m) === 103);

  const semiFinalTeams = [
    actualPropagatedTeams[101]?.homeTeam,
    actualPropagatedTeams[101]?.awayTeam,
    actualPropagatedTeams[102]?.homeTeam,
    actualPropagatedTeams[102]?.awayTeam,
  ].filter(Boolean);

  const finalists = [
    actualPropagatedTeams[104]?.homeTeam,
    actualPropagatedTeams[104]?.awayTeam,
  ].filter(Boolean);

  const thirdPlaceTeamsFromSemis = semiFinalTeams.filter(
    team => !finalists.includes(team)
  );

  const thirdPlaceHomeTeam =
    thirdPlaceTeamsFromSemis[0] || thirdPlaceMatch?.home_team || "";

  const thirdPlaceAwayTeam =
    thirdPlaceTeamsFromSemis[1] || thirdPlaceMatch?.away_team || "";
const thirdPlacePrediction = thirdPlaceMatch ? predictions[thirdPlaceMatch.id] || {} : {};
const thirdPlaceHomeGoals = parseInt(thirdPlacePrediction.home, 10);
const thirdPlaceAwayGoals = parseInt(thirdPlacePrediction.away, 10);
const thirdPlaceHasScore =
  !Number.isNaN(thirdPlaceHomeGoals) && !Number.isNaN(thirdPlaceAwayGoals);
const thirdPlaceIsDraw =
  thirdPlaceHasScore && thirdPlaceHomeGoals === thirdPlaceAwayGoals;
const thirdPlaceClearWinner =
  thirdPlaceHasScore && !thirdPlaceIsDraw
    ? thirdPlaceHomeGoals > thirdPlaceAwayGoals
      ? thirdPlaceHomeTeam
      : thirdPlaceAwayTeam
    : "";
  const thirdPlaceValue =
    thirdPlaceClearWinner || thirdPlacePrediction.advancing || "";
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
        value={championValue}
        disabled={Boolean(finalClearWinner) || (isMatchLocked ? isMatchLocked(groupMatches[0]) : false)}
        onChange={e =>
         handleAdvancingChange?.(groupMatches[0].id, e.target.value)
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
        <option value={finalHomeTeam}>{finalHomeTeam}</option>
<option value={finalAwayTeam}>{finalAwayTeam}</option>
      </select>
    </div>
  )}
  
              <KnockoutRound
                round={group.round}
                matches={groupMatches}
                predictions={predictions}
                propagatedTeams={
  group.round === "Third-place Play-off"
    ? {
        ...propagatedTeams,
        103: {
          homeTeam: thirdPlaceHomeTeam,
          awayTeam: thirdPlaceAwayTeam,
        },
      }
    : propagatedTeams
}
                actualWinnersByMatchNumber={
  group.round === "Third-place Play-off"
    ? {
        ...actualWinnersByMatchNumber,
        101: thirdPlaceHomeTeam,
        102: thirdPlaceAwayTeam,
      }
    : actualWinnersByMatchNumber
}
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
          value={thirdPlaceValue}
          disabled={Boolean(thirdPlaceClearWinner) || (isMatchLocked ? isMatchLocked(groupMatches[0]) : false)}
          onChange={e =>
          handleAdvancingChange?.(groupMatches[0].id, e.target.value)
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
         <option value={thirdPlaceHomeTeam}>{thirdPlaceHomeTeam}</option>
         <option value={thirdPlaceAwayTeam}>{thirdPlaceAwayTeam}</option>
        </select>
        <div
  style={{
    marginTop: "8px",
    fontSize: "0.62rem",
    lineHeight: 1.35,
    opacity: 0.8,
    wordBreak: "break-word",
  }}
>
  <div>DEBUG SF: {semiFinalTeams.join(" | ")}</div>
  <div>DEBUG Final: {finalists.join(" | ")}</div>
  <div>DEBUG 3rd: {thirdPlaceTeamsFromSemis.join(" | ")}</div>
  <div>DEBUG card: {thirdPlaceHomeTeam} v {thirdPlaceAwayTeam}</div>
</div>
      </div>
    )}
            </div>
          );
      })}
    </div>
  );
}