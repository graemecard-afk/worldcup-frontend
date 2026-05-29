import React from "react";

export default function KnockoutMatchCard({
  match,
  pred,
  propagatedTeams = {},
  locked,
  theme,
  formatKickoff,
  handleScoreChange,
  handleAdvancingChange,
  savePrediction,
  StatusBadge,
}) {
  const m = match;
  const isFinalOrThirdPlace =
  m.stage === "Final" || m.stage === "Third-place Play-off";

const requiresAdvancingSelection =
  !isFinalOrThirdPlace &&
  pred.home !== "" &&
  pred.away !== "" &&
  pred.home === pred.away;
  const matchNumber =
  Number(String(m.group_name ?? "").match(/\d+/)?.[0]) || null;

const propagated = matchNumber
  ? propagatedTeams[matchNumber]
  : null;

const displayHomeTeam =
  propagated?.homeTeam || m.home_team;

const displayAwayTeam =
  propagated?.awayTeam || m.away_team;

  return (
    <div
      style={{
        borderRadius: "10px",
        padding: "8px",
        border:
          theme === "dark"
            ? "1px solid rgba(148,163,184,0.35)"
            : "1px solid rgba(15,23,42,0.18)",
        background:
          theme === "dark"
            ? "rgba(15,23,42,0.9)"
            : "rgba(255,255,255,0.95)",
       minHeight: "215px",
          width: "190px",
          boxSizing: "border-box",
        }}
    >
      <div
        style={{
          fontSize: "0.72rem",
          opacity: 0.75,
          marginBottom: "4px",
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <span>{m.group_name}</span>
        <span>{formatKickoff ? formatKickoff(m.kickoff_utc) : ""}</span>
      </div>

      <div style={{ fontWeight: 700 }}>{displayHomeTeam}</div>
      <div style={{ opacity: 0.7, fontSize: "0.75rem" }}>v</div>
      <div style={{ fontWeight: 700, marginBottom: "8px" }}>
  {displayAwayTeam}
</div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Score:</span>

        <input
          type="number"
          min="0"
          value={pred.home}
          disabled={locked}
          onChange={e => handleScoreChange?.(m.id, "home", e.target.value)}
          onBlur={() => savePrediction?.(m)}
          style={{
            width: "42px",
            padding: "4px 6px",
            borderRadius: "6px",
            border: "1px solid rgba(148,163,184,0.85)",
            background: "rgba(15,23,42,0.95)",
            color: "#e5e7eb",
            textAlign: "center",
            fontSize: "0.8rem",
          }}
        />

        <span>:</span>

        <input
          type="number"
          min="0"
          value={pred.away}
          disabled={locked}
          onChange={e => handleScoreChange?.(m.id, "away", e.target.value)}
          onBlur={() => savePrediction?.(m)}
          style={{
            width: "42px",
            padding: "4px 6px",
            borderRadius: "6px",
            border: "1px solid rgba(148,163,184,0.85)",
            background: "rgba(15,23,42,0.95)",
            color: "#e5e7eb",
            textAlign: "center",
            fontSize: "0.8rem",
          }}
        />
      </div>
      {requiresAdvancingSelection && (
  <div style={{ marginBottom: "2px" }}>
    <select
      value={pred.advancing || ""}
      disabled={locked}
      onChange={e => handleAdvancingChange?.(m.id, e.target.value)}
      onBlur={() => savePrediction?.(m)}
      style={{
        width: "100%",
        padding: "2px 4px",
        borderRadius: "6px",
        border: "1px solid rgba(148,163,184,0.85)",
        background: "rgba(15,23,42,0.95)",
        color: "#e5e7eb",
        fontSize: "0.68rem",
      }}
    >
      <option value="">Winner if tied</option>
      <option value={displayHomeTeam}>{displayHomeTeam}</option>
<option value={displayAwayTeam}>{displayAwayTeam}</option>
    </select>
  </div>
)}

              <div
          style={{
            display: "grid",
            gridTemplateColumns: "44px 42px 8px 42px",
            alignItems: "center",
            columnGap: "6px",
            rowGap: "6px",
            marginBottom: "6px",
          }}
        >
          <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Act:</span>
          <span style={{ width: "42px", padding: "4px 6px", borderRadius: "6px", border: "1px solid rgba(148,163,184,0.85)", background: "rgba(148,163,184,0.25)", fontSize: "0.8rem", fontWeight: 600, textAlign: "center", boxSizing: "border-box" }}>
            {m.result_finalized ? (m.result_home_goals ?? "–") : "–"}
          </span>
          <span>:</span>
          <span style={{ width: "42px", padding: "4px 6px", borderRadius: "6px", border: "1px solid rgba(148,163,184,0.85)", background: "rgba(148,163,184,0.25)", fontSize: "0.8rem", fontWeight: 600, textAlign: "center", boxSizing: "border-box" }}>
            {m.result_finalized ? (m.result_away_goals ?? "–") : "–"}
          </span>

          <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Pts:</span>
          <span style={{ width: "42px", padding: "4px 6px", borderRadius: "6px", border: "1px solid rgba(148,163,184,0.85)", background: "rgba(148,163,184,0.25)", fontSize: "0.8rem", fontWeight: 700, textAlign: "center", boxSizing: "border-box" }}>
            {pred.points === 0 || typeof pred.points === "number" ? pred.points : "–"}
          </span>
        </div>

      <div style={{ minHeight: "28px" }}>
  {StatusBadge && (
    <StatusBadge status={locked ? "locked" : pred.status} theme={theme} />
  )}
</div>
    </div>
  );
}