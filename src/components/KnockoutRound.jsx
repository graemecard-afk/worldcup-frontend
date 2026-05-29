import React from "react";
import KnockoutMatchCard from "./KnockoutMatchCard";

export default function KnockoutRound({
  round,
  matches = [],
  predictions = {},
  propagatedTeams = {},
  theme,
  formatKickoff,
  isMatchLocked,
  handleScoreChange,
  handleAdvancingChange,
  savePrediction,
  StatusBadge,
  cardGap = 10,
  matchSpacing = {},
  labelOffsetY = 0,
}) {
  const CARD_SLOT_HEIGHT = 230;

  return (
    <div>
      <h4
        style={{
          margin: "0 0 8px",
          fontSize: "0.85rem",
          transform: labelOffsetY
            ? `translateY(${labelOffsetY}px)`
            : round === "Quarter-final"
            ? "translateY(140px)"
            : round === "Semi-final"
            ? "translateY(420px)"
            : "none",
        }}
      >
        {round}
      </h4>

      <div
        style={{
          position: "relative",
          minHeight:
            matches.length > 0
              ? `${Math.max(
                  ...matches.map(m => {
                    const key =
                      m.group_name ?? m.match_number ?? m.matchNumber ?? m.id;
                    return matchSpacing[key] || 0;
                  })
                ) + CARD_SLOT_HEIGHT}px`
              : `${CARD_SLOT_HEIGHT}px`,
        }}
      >
        {matches.map((m, index) => {
          const pred = predictions[m.id] || {
            home: "",
            away: "",
            advancing: "",
            status: "idle",
          };

          const locked = isMatchLocked ? isMatchLocked(m) : false;
          const key = m.group_name ?? m.match_number ?? m.matchNumber ?? m.id;
          const top = index * (CARD_SLOT_HEIGHT + cardGap) + (matchSpacing[key] || 0);

          return (
            <div
              key={m.id}
              style={{
                position: "absolute",
                top: `${top}px`,
                left: 0,
                height: `${CARD_SLOT_HEIGHT}px`,
              }}
            >
              <KnockoutMatchCard
                match={m}
                pred={pred}
                propagatedTeams={propagatedTeams}
                locked={locked}
                theme={theme}
                formatKickoff={formatKickoff}
                handleScoreChange={handleScoreChange}
                handleAdvancingChange={handleAdvancingChange}
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