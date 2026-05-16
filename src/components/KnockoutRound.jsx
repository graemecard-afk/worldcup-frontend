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
  cardGap = 10,
  matchSpacing = {},
}) {
  return (
    <div>
      <h4 style={{ margin: "0 0 8px", fontSize: "0.85rem" }}>
        {round}
      </h4>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${cardGap}px`,
        }}
      >
        {matches.map(m => {
          const pred = predictions[m.id] || {
            home: "",
            away: "",
            status: "idle",
          };

          const locked = isMatchLocked ? isMatchLocked(m) : false;

          return (
            <div
              key={m.id}
              style={{
                marginTop:
                  matchSpacing[
                    m.group_name ?? m.match_number ?? m.matchNumber ?? m.id
                  ] || 0,
              }}
            >
              <KnockoutMatchCard
                match={m}
                pred={pred}
                locked={locked}
                theme={theme}
                formatKickoff={formatKickoff}
                handleScoreChange={handleScoreChange}
                savePrediction={savePrediction}
                StatusBadge={StatusBadge}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}