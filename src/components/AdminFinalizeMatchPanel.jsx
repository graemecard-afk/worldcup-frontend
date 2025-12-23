import React from "react";

/**
 * AdminFinalizeMatchPanel
 *
 * Pure UI component for the admin "finalise match" widget.
 * Keep all business logic (api calls, admin checks, reloads) in App.jsx for now.
 *
 * Props are intentionally flexible so you can wire it up with minimal changes.
 */
export default function AdminFinalizeMatchPanel({
  theme = "dark",

  // Data
  matches = [],

  // Controlled inputs
  selectedMatchId,
  onSelectMatch, // (matchId: string|number) => void
  homeGoals,
  onChangeHomeGoals, // (value: string) => void
  awayGoals,
  onChangeAwayGoals, // (value: string) => void

  // Actions / state
  onSave, // () => void | Promise<void>
  saving = false,
  status = "",

  // Optional
  title = "Admin: Finalise a match",
}) {
  const isDark = String(theme).toLowerCase() === "dark";

  const cardStyle = {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
  };

  const labelStyle = { display: "block", fontSize: 13, opacity: 0.9, marginBottom: 6 };
  const rowStyle = { display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" };

  const inputStyle = {
    width: 110,
    padding: "8px 10px",
    borderRadius: 10,
    border: `1px solid ${isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.16)"}`,
    background: isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.9)",
    color: isDark ? "white" : "black",
    outline: "none",
  };

  const selectStyle = {
    minWidth: 280,
    maxWidth: 520,
    flex: 1,
    padding: "8px 10px",
    borderRadius: 10,
    border: `1px solid ${isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.16)"}`,
    background: isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.9)",
    color: isDark ? "white" : "black",
    outline: "none",
  };

  const buttonStyle = {
    padding: "9px 12px",
    borderRadius: 10,
    border: `1px solid ${isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)"}`,
    background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
    color: isDark ? "white" : "black",
    cursor: saving ? "not-allowed" : "pointer",
    opacity: saving ? 0.6 : 1,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };

  function formatMatchLabel(m) {
    // Try to match common match shapes without assuming your exact schema.
    const home = m?.home_team ?? m?.homeTeam ?? m?.home ?? "";
    const away = m?.away_team ?? m?.awayTeam ?? m?.away ?? "";
    const stage = m?.stage ?? "";
    const group = m?.group_name ?? m?.groupName ?? "";
    const kickoff = m?.kickoff_utc ?? m?.kickoffUtc ?? m?.kickoff ?? "";

    const left = [stage, group].filter(Boolean).join(" • ");
    const teams = [home, away].filter(Boolean).join(" vs ");
    const when = kickoff ? ` — ${kickoff}` : "";
    return `${left ? left + " — " : ""}${teams || "Match"}${when}`;
  }

  const hasMatches = Array.isArray(matches) && matches.length > 0;

  return (
    <div style={cardStyle}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>

      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Select match</label>
        <select
          style={selectStyle}
          value={selectedMatchId ?? ""}
          onChange={e => onSelectMatch && onSelectMatch(e.target.value)}
          disabled={!hasMatches || saving}
        >
          <option value="">{hasMatches ? "Choose a match…" : "No matches loaded"}</option>
          {hasMatches &&
            matches.map((m, idx) => {
              const id = m?.id ?? m?.match_id ?? m?.matchId ?? idx;
              return (
                <option key={String(id)} value={String(id)}>
                  {formatMatchLabel(m)}
                </option>
              );
            })}
        </select>
      </div>

      <div style={rowStyle}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>
          Home goals
          <input
            style={inputStyle}
            inputMode="numeric"
            placeholder="0"
            value={homeGoals ?? ""}
            onChange={e => onChangeHomeGoals && onChangeHomeGoals(e.target.value)}
            disabled={saving}
          />
        </label>

        <label style={{ ...labelStyle, marginBottom: 0 }}>
          Away goals
          <input
            style={inputStyle}
            inputMode="numeric"
            placeholder="0"
            value={awayGoals ?? ""}
            onChange={e => onChangeAwayGoals && onChangeAwayGoals(e.target.value)}
            disabled={saving}
          />
        </label>

        <button
          type="button"
          style={buttonStyle}
          onClick={() => onSave && onSave()}
          disabled={saving}
          title={saving ? "Saving…" : "Save final result"}
        >
          {saving ? "Saving…" : "Save result"}
        </button>
      </div>

      {status ? (
        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.95, whiteSpace: "pre-wrap" }}>
          {status}
        </div>
      ) : null}
    </div>
  );
}
