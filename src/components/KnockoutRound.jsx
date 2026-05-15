import React from "react";
import KnockoutMatchCard from "./KnockoutMatchCard";

export default function KnockoutRound({
  round,
  matches = [],
  predictions = {},
  theme,
  formatKickoff,
  isMatchLocked,
  handleScoreChange,
  savePrediction,
  StatusBadge,
}) {
  return (
    <div>
      <h4 style={{ margin: "0 0 8px", fontSize: "0.85rem" }}>
        {round}
      </h4>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {matches.map(m => {
          const pred = predictions[m.id] || {
            home: "",
            away: "",
            status: "idle",
          };

          const locked = isMatchLocked ? isMatchLocked(m) : false;

          return (
            <KnockoutMatchCard
              key={m.id}
              match={m}
              pred={pred}
              locked={locked}
              theme={theme}
              formatKickoff={formatKickoff}
              handleScoreChange={handleScoreChange}
              savePrediction={savePrediction}
              StatusBadge={StatusBadge}
            />
          );
        })}
      </div>
    </div>
  );
}