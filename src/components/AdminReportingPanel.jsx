import React, { useState } from "react";
import { apiGet, apiPost } from "../api/client.js";

const TOURNAMENT_ID = "11111111-1111-1111-1111-111111111111";

export default function AdminReportingPanel({ tournamentId = TOURNAMENT_ID }) {
  const [snapshotName, setSnapshotName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [message, setMessage] = useState("");
  const [reportRows, setReportRows] = useState([]);

  async function saveSnapshot() {
    setMessage("");

    if (!snapshotName.trim()) {
      setMessage("Please enter a snapshot name.");
      return;
    }

    try {
      setSaving(true);

      const data = await apiPost(`/leaderboard/${tournamentId}/snapshots`, {
        snapshot_name: snapshotName.trim(),
      });

      setMessage(`Snapshot saved. Rows saved: ${data.rows_saved}.`);
    } catch (err) {
      setMessage(err.message || "Failed to save snapshot.");
    } finally {
      setSaving(false);
    }
  }

  async function generateReport() {
    setMessage("");

    try {
      setLoadingReport(true);

      const data = await apiGet(`/leaderboard/${tournamentId}/snapshots/report`);
      

              const rows = data?.biggest_movers || data?.top_scorers || [];

        setReportRows(rows);

setReportRows(rows);
      setMessage("Report generated.");
    } catch (err) {
      setMessage(err.message || "Failed to generate report.");
    } finally {
      setLoadingReport(false);
    }
  }

  const topScorers = [...reportRows]
    .sort((a, b) => Number(b.points_gained || 0) - Number(a.points_gained || 0))
    .slice(0, 10);

  const biggestMovers = [...reportRows]
    .sort((a, b) => Number(b.rank_change || 0) - Number(a.rank_change || 0))
    .slice(0, 10);

  return (
    <div style={{ marginTop: "16px" }}>
      <h3 style={{ marginTop: 0 }}>Admin Reporting</h3>

      <label style={{ display: "block", marginBottom: "8px" }}>
        Snapshot Name
        <input
          type="text"
          value={snapshotName}
          onChange={(e) => setSnapshotName(e.target.value)}
          placeholder="After Matchday 1"
          style={{
            display: "block",
            marginTop: "6px",
            width: "100%",
            maxWidth: "360px",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid rgba(148,163,184,0.5)",
          }}
        />
      </label>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button type="button" onClick={saveSnapshot} disabled={saving}>
          {saving ? "Saving..." : "Save Snapshot"}
        </button>

        <button type="button" onClick={generateReport} disabled={loadingReport}>
          {loadingReport ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}

      {reportRows.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <h4>Top Scorers</h4>
          <ul>
            {topScorers.map((row) => (
              <li key={`scorer-${row.user_id}`}>
                {row.user_name} (+{row.points_gained})
              </li>
            ))}
          </ul>

          <h4>Biggest Movers</h4>
          <ul>
            {biggestMovers.map((row) => (
              <li key={`mover-${row.user_id}`}>
                {row.user_name} ↑{row.rank_change}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
