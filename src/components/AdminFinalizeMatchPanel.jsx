import React, { useState } from "react";
import { apiPost } from "../api/client.js";

/**
 * OPTION A VERSION
 * ----------------
 * This component MATCHES existing App.jsx usage exactly.
 *
 * App.jsx uses:
 * <AdminFinalizeMatchPanel
 *   apiBaseUrl={''}
 *   token={getStoredToken()}
 *   tournamentId={currentTournament?.id}
 *   matches={matches}
 *   onAfterSave={refreshMatchesAndPredictions}
 * />
 *
 * No App.jsx changes required.
 */
export default function AdminFinalizeMatchPanel({
  apiBaseUrl = "",
  token,
  tournamentId,
  matches = [],
  onAfterSave,
  actualPropagatedTeams = {},
}) {
  const [matchId, setMatchId] = useState("");
  const [homeGoals, setHomeGoals] = useState("");
  const [awayGoals, setAwayGoals] = useState("");
  const [actualAdvancingTeam, setActualAdvancingTeam] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

 function formatMatchLabel(m) {
  const matchNumber =
    Number(String(m?.group_name ?? "").match(/\d+/)?.[0]) || null;

  const propagated = matchNumber
   ? actualPropagatedTeams[matchNumber]
    : null;

  const home = propagated?.homeTeam || m?.home_team || "";
  const away = propagated?.awayTeam || m?.away_team || "";

  const stage = m?.stage ?? "";
  const group = m?.group_name ?? "";

  return `${stage}${group ? " " + group : ""}: ${home} vs ${away}`;
}
  async function handleSave() {
    if (!matchId) {
      setStatus("❌ Please select a match");
      return;
    }

    const hg = Number(homeGoals);
    const ag = Number(awayGoals);

    if (!Number.isInteger(hg) || !Number.isInteger(ag)) {
      setStatus("❌ Enter valid goal numbers");
      return;
    }
let resultAdvancingTeam = null;

if (isKnockoutMatch) {
 if (hg > ag) resultAdvancingTeam = selectedHomeTeam;
if (ag > hg) resultAdvancingTeam = selectedAwayTeam;
  if (hg === ag) resultAdvancingTeam = actualAdvancingTeam || null;
}

if (needsAdvancingTeam && !resultAdvancingTeam) {
  setStatus("❌ Select the team that advanced");
  return;
}
    setSaving(true);
    setStatus("");

    try {
      await apiPost(`/matches/${matchId}/result`, {
        home_goals: hg,
        away_goals: ag,
        actual_advancing_team: resultAdvancingTeam,
      });

      setStatus("✅ Saved. Refreshing data…");
      setHomeGoals("");
      setAwayGoals("");
      setActualAdvancingTeam("");
      setMatchId("");

      if (onAfterSave) {
        await onAfterSave();
      }
    } catch (e) {
      setStatus(`❌ Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }
async function handleUnfinalise() {
  if (!matchId) {
    setStatus("❌ Please select a match");
    return;
  }

  setSaving(true);
  setStatus("");

  try {
    await apiPost(`/matches/${matchId}/unfinalise`);

    setStatus("✅ Match unfinalised. Refreshing data…");
    setHomeGoals("");
    setAwayGoals("");
    setActualAdvancingTeam("");
    setMatchId("");

    if (onAfterSave) {
      await onAfterSave();
    }
  } catch (e) {
    setStatus(`❌ Unfinalise failed: ${e.message}`);
  } finally {
    setSaving(false);
  }
}
async function handleUnfinaliseAllKnockouts() {
  const confirmed = window.confirm(
    "Unfinalise all knockout matches? This will clear all knockout results."
  );

  if (!confirmed) return;

  setSaving(true);
  setStatus("");

  try {
    const result = await apiPost("/matches/knockouts/unfinalise-all");

    setStatus(`✅ Unfinalised ${result.count ?? 0} knockout matches. Refreshing data…`);
    setHomeGoals("");
    setAwayGoals("");
    setActualAdvancingTeam("");
    setMatchId("");

    if (onAfterSave) {
      await onAfterSave();
    }
  } catch (e) {
    setStatus(`❌ Unfinalise all failed: ${e.message}`);
  } finally {
    setSaving(false);
  }
}
const selectedMatch = matches.find(m => String(m.id) === String(matchId));
const knockoutStages = [
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Third-place Play-off",
  "Final",
];

const isKnockoutMatch = selectedMatch && knockoutStages.includes(selectedMatch.stage);
const selectedMatchNumber =
  Number(String(selectedMatch?.group_name ?? "").match(/\d+/)?.[0]) || null;

const selectedPropagated = selectedMatchNumber
  ? actualPropagatedTeams[selectedMatchNumber]
  : null;

const selectedHomeTeam = selectedPropagated?.homeTeam || selectedMatch?.home_team || "";
const selectedAwayTeam = selectedPropagated?.awayTeam || selectedMatch?.away_team || "";
const isDraw = homeGoals !== "" && awayGoals !== "" && Number(homeGoals) === Number(awayGoals);
const needsAdvancingTeam = isKnockoutMatch && isDraw;

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Admin: Finalise match</h3>

      <div style={{ marginBottom: 8 }}>
        <select
          value={matchId}
          onChange={e => setMatchId(e.target.value)}
          disabled={saving}
        >
          <option value="">Select match…</option>
          {matches.map(m => (
  <option key={m.id} value={m.id} >
    {formatMatchLabel(m)}{m.result_finalized ? ' (Finalized)' : ''}
  </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          type="number"
          placeholder="Home"
          value={homeGoals}
          onChange={e => setHomeGoals(e.target.value)}
          disabled={saving || selectedMatch?.result_finalized}
        />
        <input
          type="number"
          placeholder="Away"
          value={awayGoals}
          onChange={e => setAwayGoals(e.target.value)}
          disabled={saving || selectedMatch?.result_finalized}
        />
        {needsAdvancingTeam && selectedMatch && (
  <select
    value={actualAdvancingTeam}
    onChange={e => setActualAdvancingTeam(e.target.value)}
    disabled={saving || selectedMatch?.result_finalized}
  >
    <option value="">Advanced…</option>
    <option value={selectedHomeTeam}>{selectedHomeTeam}</option>
    <option value={selectedAwayTeam}>{selectedAwayTeam}</option>
  </select>
)}
        <button onClick={handleSave} disabled={saving || selectedMatch?.result_finalized}>
  {saving ? "Saving…" : "Save"}
</button>

<button
  onClick={handleUnfinalise}
  disabled={saving || !selectedMatch || !selectedMatch.result_finalized}
  style={{ marginLeft: 8 }}
>
  Unfinalise
</button>
<button
  onClick={handleUnfinaliseAllKnockouts}
  disabled={saving}
  style={{ marginLeft: 8, color: "#ef4444" }}
>
  Unfinalise all knockouts
</button>

      </div>

      {status && <div>{status}</div>}
    </div>
  );
}
