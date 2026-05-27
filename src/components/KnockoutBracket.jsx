import React from "react";
import KnockoutBracketLeft from "./KnockoutBracketLeft";
import KnockoutBracketCenter from "./KnockoutBracketCenter";
import KnockoutBracketRight from "./KnockoutBracketRight";

export default function KnockoutBracket({
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
  const sharedProps = {
    matches,
    predictions,
    theme,
    formatKickoff,
    isMatchLocked,
    handleScoreChange,
    handleAdvancingChange,
    savePrediction,
    StatusBadge,
  };

  return (
    <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px 1fr",
          gap: "18px",
          minWidth: "1180px",
          alignItems: "center",
        }}
      >
        <KnockoutBracketLeft {...sharedProps} />
        <KnockoutBracketCenter {...sharedProps} />
        <KnockoutBracketRight {...sharedProps} />
      </div>
    </div>
  );
}