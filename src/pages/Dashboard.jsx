import React from "react";

export default function DashboardPage({
  // Data
  user,
  theme,
  isAdmin,
  currentTournament,
  matches,
  predictions,
  groupTables,
  loadingData,
  dataError,

  // Assets / helpers
  BALL_IMAGE,
  formatKickoff,
  isMatchLocked,

  // Actions
  loadTournamentAndMatches,
  handleScoreChange,
  savePrediction,
  refreshMatchesAndPredictions,

  // Components (passed through from App.jsx to avoid moving them yet)
  TitleRow,
  Sub,
  StatusBadge,
  AdminFinalizeMatchPanel,

  // Token helper (kept identical to your current usage)
  getStoredToken,
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "14px",
          alignItems: "flex-start",
        }}
      >
        <div>
          <TitleRow />
          <Sub>Welcome, {user.name}</Sub>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid rgba(190,242,100,0.8)",
            boxShadow: "0 0 0 3px rgba(15,23,42,0.9)",
            flexShrink: 0,
          }}
        >
          <img
            src={BALL_IMAGE}
            alt="Football"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ textAlign: "left", flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.85rem",
              opacity: 0.9,
            }}
          >
            Get your predictions in at least 2h before kick-off, after which
            time they will be locked. See if you can outwit your mates!
          </p>
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={loadTournamentAndMatches}
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            border: "none",
            background:
              "linear-gradient(135deg, #3b82f6 0%, #2563eb 40%, #3b82f6 100%)",
            color: "#f9fafb",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(37,99,235,0.45)",
          }}
        >
          Load Dummy Cup matches
        </button>
      </div>

      {loadingData && <Sub>Loading tournament data…</Sub>}
      {dataError && (
        <p style={{ color: "#fecaca", fontSize: "0.85rem" }}>{dataError}</p>
      )}

      {currentTournament && (
        <div style={{ textAlign: "left", marginBottom: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "1rem" }}>Tournament</h3>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
            {currentTournament.name} ({currentTournament.year})
          </p>
        </div>
      )}

      {matches.length > 0 && (
        <div style={{ textAlign: "left", marginTop: "8px" }}>
          <h3 style={{ marginBottom: "8px", fontSize: "1rem" }}>
            Your group stage predictions
          </h3>
          <p
            style={{
              marginTop: 0,
              marginBottom: "6px",
              fontSize: "0.8rem",
              opacity: 0.8,
            }}
          >
            Enter scores and tap away from the field – your prediction will
            autosave for that match.
          </p>

          <div
            style={{
              maxHeight: "280px",
              overflowY: "auto",
              borderRadius: "12px",
              border:
                theme === "dark"
                  ? "1px solid rgba(30,64,175,0.7)"
                  : "1px solid rgba(15,23,42,0.15)",
              background:
                theme === "dark"
                  ? "rgba(15,23,42,0.85)"
                  : "rgba(255,255,255,0.95)",
            }}
          >
            {isAdmin && (
              <AdminFinalizeMatchPanel
                apiBaseUrl={""}
                token={getStoredToken()}
                tournamentId={currentTournament?.id}
                matches={matches}
                onAfterSave={refreshMatchesAndPredictions}
              />
            )}

            {matches.map(m => {
              const pred = predictions[m.id] || {
                home: "",
                away: "",
                status: "idle",
              };

              const locked = isMatchLocked(m);

              return (
                <div
                  key={m.id}
                  style={{
                    padding: "8px 10px",
                    borderBottom:
                      theme === "dark"
                        ? "1px solid rgba(15,23,42,0.9)"
                        : "1px solid rgba(0,0,0,0.08)",
                    fontSize: "0.9rem",
                    color: theme === "dark" ? "#e5e7eb" : "#0f172a",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "10px",
                      marginBottom: "4px",
                    }}
                  >
                    <span>
                      <div>
                        <strong>{m.home_team}</strong> vs{" "}
                        <strong>{m.away_team}</strong>
                      </div>
                      {m.group_name ? (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            opacity: 0.75,
                            marginTop: 2,
                          }}
                        >
                          {m.group_name}
                        </div>
                      ) : null}
                    </span>

                    <span style={{ opacity: 0.8, whiteSpace: "nowrap" }}>
                      {formatKickoff(m.kickoff_utc)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                        Score:
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={pred.home}
                        disabled={locked}
                        onChange={e =>
                          handleScoreChange(m.id, "home", e.target.value)
                        }
                        onBlur={() => savePrediction(m)}
                        style={{
                          width: "46px",
                          padding: "4px 6px",
                          borderRadius: "6px",
                          border: "1px solid rgba(148,163,184,0.85)",
                          background: "rgba(15,23,42,0.95)",
                          color: "#e5e7eb",
                          textAlign: "center",
                          fontSize: "0.85rem",
                        }}
                      />

                      <span>:</span>

                      <input
                        type="number"
                        min="0"
                        value={pred.away}
                        disabled={locked}
                        onChange={e =>
                          handleScoreChange(m.id, "away", e.target.value)
                        }
                        onBlur={() => savePrediction(m)}
                        style={{
                          width: "46px",
                          padding: "4px 6px",
                          borderRadius: "6px",
                          border: "1px solid rgba(148,163,184,0.85)",
                          background: "rgba(15,23,42,0.95)",
                          color: "#e5e7eb",
                          textAlign: "center",
                          fontSize: "0.85rem",
                        }}
                      />

                    </div>

                    {/* ACTUAL + POINTS (read-only) */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                          Act:
                        </span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "46px",
                            padding: "4px 6px",
                            borderRadius: "6px",
                            border: "1px solid rgba(148,163,184,0.85)",
                            background: "rgba(148,163,184,0.25)",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          {m.result_finalized ? (m.result_home_goals ?? "–") : "–"}
                        </span>

                        <span>:</span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "46px",
                            padding: "4px 6px",
                            borderRadius: "6px",
                            border: "1px solid rgba(148,163,184,0.85)",
                            background: "rgba(148,163,184,0.25)",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          {m.result_finalized ? (m.result_away_goals ?? "–") : "–"}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                          Pts:
                        </span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "52px",
                            padding: "4px 6px",
                            borderRadius: "6px",
                            border: "1px solid rgba(148,163,184,0.85)",
                            background: "rgba(148,163,184,0.25)",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                          }}
                        >
                          {pred.points === 0 || typeof pred.points === "number"
                            ? pred.points
                            : "–"}
                        </span>
                      </div>
                    </div>

                    <StatusBadge
                      status={locked ? "locked" : pred.status}
                      theme={theme}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div style={{ textAlign: "left", marginTop: "16px" }}>
          <h3 style={{ marginBottom: "8px", fontSize: "1rem" }}>
            Predicted group standings
          </h3>
          <p
            style={{
              marginTop: 0,
              marginBottom: "6px",
              fontSize: "0.8rem",
              opacity: 0.8,
            }}
          >
            These tables are based on your predicted scores only.
          </p>

          {Object.keys(groupTables).length === 0 ? (
            <p
              style={{
                marginTop: 0,
                fontSize: "0.8rem",
                opacity: 0.75,
              }}
            >
              Once you&apos;ve entered at least one full scoreline (both home and
              away), your live group tables will appear here.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                maxHeight: "260px",
                overflowY: "auto",
              }}
            >
              {Object.entries(groupTables).map(([groupName, teams]) => (
                <div
                  key={groupName}
                  style={{
                    borderRadius: "10px",
                    border:
                      theme === "dark"
                        ? "1px solid rgba(30,64,175,0.7)"
                        : "1px solid rgba(15,23,42,0.15)",
                    background:
                      theme === "dark"
                        ? "rgba(15,23,42,0.9)"
                        : "rgba(255,255,255,0.96)",
                    padding: "8px 10px",
                    color: theme === "dark" ? "#e5e7eb" : "#0f172a",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <strong>{groupName}</strong>
                  </div>

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.8rem",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            borderBottom:
                              theme === "dark"
                                ? "1px solid rgba(30,64,175,0.7)"
                                : "1px solid rgba(0,0,0,0.15)",
                            color: theme === "dark" ? "#e5e7eb" : "#0f172a",
                          }}
                        >
                          Team
                        </th>
                        <th style={{ paddingBottom: "4px", textAlign: "center" }}>P</th>
                        <th style={{ paddingBottom: "4px", textAlign: "center" }}>W</th>
                        <th style={{ paddingBottom: "4px", textAlign: "center" }}>D</th>
                        <th style={{ paddingBottom: "4px", textAlign: "center" }}>L</th>
                        <th style={{ paddingBottom: "4px", textAlign: "center" }}>GF</th>
                        <th style={{ paddingBottom: "4px", textAlign: "center" }}>GA</th>
                        <th style={{ paddingBottom: "4px", textAlign: "center" }}>GD</th>
                        <th style={{ paddingBottom: "4px", textAlign: "center" }}>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map(team => (
                        <tr key={team.team}>
                          <td style={{ padding: "4px 0" }}>{team.team}</td>
                          <td style={{ padding: "4px 0", textAlign: "center" }}>
                            {team.played}
                          </td>
                          <td style={{ padding: "4px 0", textAlign: "center" }}>
                            {team.won}
                          </td>
                          <td style={{ padding: "4px 0", textAlign: "center" }}>
                            {team.drawn}
                          </td>
                          <td style={{ padding: "4px 0", textAlign: "center" }}>
                            {team.lost}
                          </td>
                          <td style={{ padding: "4px 0", textAlign: "center" }}>
                            {team.gf}
                          </td>
                          <td style={{ padding: "4px 0", textAlign: "center" }}>
                            {team.ga}
                          </td>
                          <td style={{ padding: "4px 0", textAlign: "center" }}>
                            {team.gd}
                          </td>
                          <td style={{ padding: "4px 0", textAlign: "center", fontWeight: 600 }}>
                            {team.pts}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loadingData && !dataError && matches.length === 0 && (
        <Sub>
          Click <strong>Load Dummy Cup matches</strong> to fetch games from the
          backend.
        </Sub>
      )}
    </>
  );
}
