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
}) {
  const [matchId, setMatchId] = useState("");
  const [homeGoals, setHomeGoals] = useState("");
  const [awayGoals, setAwayGoals] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  function formatMatchLabel(m) {
    const home = m?.home_team ?? "";
    const away = m?.away_team ?? "";
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

    setSaving(true);
    setStatus("");

    try {
      await apiPost(`/matches/${matchId}/result`, {
        home_goals: hg,
        away_goals: ag,
      });

      setStatus("✅ Saved. Refreshing data…");
      setHomeGoals("");
      setAwayGoals("");
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
const selectedMatch = matches.find(m => String(m.id) === String(matchId));

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

      </div>

      {status && <div>{status}</div>}
    </div>
  );
}
