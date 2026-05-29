import React, { useMemo, useState } from "react";
import { apiPost } from "../api/client.js";

function getMatchNumber(match) {
  const raw =
    match.group_name ??
    match.match_number ??
    match.matchNumber ??
    match.code ??
    match.name ??
    "";
  const found = String(raw).match(/\d+/);
  return found ? Number(found[0]) : null;
}

export default function AdminKnockoutTeamPanel({
  matches = [],
  onAfterSave,
}) {
  const roundOf32Matches = useMemo(
  () =>
    matches
      .filter(m => m.stage === "Round of 32")
      .sort((a, b) => (getMatchNumber(a) ?? 0) - (getMatchNumber(b) ?? 0)),
  [matches]
);

  const [matchId, setMatchId] = useState("");
  const [slot, setSlot] = useState("home_team");
  const [team, setTeam] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const selectedMatch = roundOf32Matches.find(m => String(m.id) === String(matchId));

  async function handleSave() {
    if (!matchId) {
      setStatus("❌ Please select a knockout match");
      return;
    }

    if (!team.trim()) {
      setStatus("❌ Enter a team name");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      await apiPost(`/matches/${matchId}/team-label`, {
        slot,
        team: team.trim(),
      });

      setStatus("✅ Team label updated. Refreshing data…");
      setTeam("");

      if (onAfterSave) {
        await onAfterSave();
      }
    } catch (e) {
      setStatus(`❌ Update failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Admin: Knockout team labels</h3>

      <div style={{ marginBottom: 8 }}>
        <select
          value={matchId}
          onChange={e => setMatchId(e.target.value)}
          disabled={saving}
        >
          <option value="">Select knockout match…</option>
          {roundOf32Matches.map(m => (
            <option key={m.id} value={m.id}>
              {m.group_name}: {m.home_team} vs {m.away_team}
            </option>
          ))}
        </select>
      </div>

      {selectedMatch && (
        <div style={{ marginBottom: 8, fontSize: "0.85rem", opacity: 0.9 }}>
          Current: {selectedMatch.home_team} vs {selectedMatch.away_team}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select
          value={slot}
          onChange={e => setSlot(e.target.value)}
          disabled={saving}
        >
          <option value="home_team">Home slot</option>
          <option value="away_team">Away slot</option>
        </select>

        <input
          type="text"
          placeholder="New team name"
          value={team}
          onChange={e => setTeam(e.target.value)}
          disabled={saving}
        />

        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Update team"}
        </button>
      </div>

      {status && <div>{status}</div>}
    </div>
  );
}