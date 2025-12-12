        {matches.length > 0 && (
          <div style={{ textAlign: 'left', marginTop: '8px' }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1rem' }}>
              Your group stage predictions
            </h3>
            <p
              style={{
                marginTop: 0,
                marginBottom: '6px',
                fontSize: '0.8rem',
                opacity: 0.8,
              }}
            >
              Enter scores and tap away from the field – your prediction will
              autosave for that match.
            </p>
            <div
              style={{
                maxHeight: '280px',
                overflowY: 'auto',
                borderRadius: '12px',
                border: '1px solid rgba(30,64,175,0.7)',
                background: 'rgba(15,23,42,0.85)',
              }}
            >
              {matches.map(m => {
                const pred = predictions[m.id] || {
                  home: '',
                  away: '',
                  status: 'idle',
                };

                let statusLabel = '';
                let statusColor = '#9ca3af';

                if (pred.status === 'saving') {
                  statusLabel = 'Saving…';
                  statusColor = '#fbbf24';
                } else if (pred.status === 'saved') {
                  statusLabel = 'Saved';
                  statusColor = '#22c55e';
                } else if (pred.status === 'error') {
                  statusLabel = 'Error – will retry on next change';
                  statusColor = '#f97373';
                } else if (pred.status === 'dirty') {
                  statusLabel = 'Changed – will save on blur';
                  statusColor = '#60a5fa';
                }

                return (
                  <div
                    key={m.id}
                    style={{
                      padding: '8px 10px',
                      borderBottom: '1px solid rgba(15,23,42,0.9)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '10px',
                        marginBottom: '4px',
                      }}
                    >
                      <span>
                        <strong>{m.home_team}</strong> vs{' '}
                        <strong>{m.away_team}</strong>
                        {m.group_name ? ` – ${m.group_name}` : ''}
                      </span>
                      <span style={{ opacity: 0.8, whiteSpace: 'nowrap' }}>
                        {formatKickoff(m.kickoff_utc)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                          Score:
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={pred.home}
                          onChange={e =>
                            handleScoreChange(m.id, 'home', e.target.value)
                          }
                          onBlur={() => savePrediction(m)}
                          style={{
                            width: '46px',
                            padding: '4px 6px',
                            borderRadius: '6px',
                            border: '1px solid rgba(148,163,184,0.85)',
                            background: 'rgba(15,23,42,0.95)',
                            color: '#e5e7eb',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                          }}
                        />
                        <span>:</span>
                        <input
                          type="number"
                          min="0"
                          value={pred.away}
                          onChange={e =>
                            handleScoreChange(m.id, 'away', e.target.value)
                          }
                          onBlur={() => savePrediction(m)}
                          style={{
                            width: '46px',
                            padding: '4px 6px',
                            borderRadius: '6px',
                            border: '1px solid rgba(148,163,184,0.85)',
                            background: 'rgba(15,23,42,0.95)',
                            color: '#e5e7eb',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: statusColor,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {matches.length > 0 && (
          <div style={{ textAlign: 'left', marginTop: '16px' }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1rem' }}>
              Predicted group standings
            </h3>
            <p
              style={{
                marginTop: 0,
                marginBottom: '6px',
                fontSize: '0.8rem',
                opacity: 0.8,
              }}
            >
              These tables are based on your predicted scores only.
            </p>

            {Object.keys(groupTables).length === 0 ? (
              <p
                style={{
                  marginTop: 0,
                  fontSize: '0.8rem',
                  opacity: 0.75,
                }}
              >
                Once you&apos;ve entered at least one full scoreline (both home
                and away), your live group tables will appear here.
              </p>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {Object.entries(groupTables).map(([groupName, teams]) => (
                  <div
                    key={groupName}
                    style={{
                      borderRadius: '10px',
                      border: '1px solid rgba(30,64,175,0.7)',
                      background: 'rgba(15,23,42,0.9)',
                      padding: '8px 10px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <strong>{groupName}</strong>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          opacity: 0.8,
                        }}
                      >
                        P, W, D, L, GF, GA, GD, Pts
                      </span>
                    </div>

                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.8rem',
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              textAlign: 'left',
                              paddingBottom: '4px',
                              borderBottom:
                                '1px solid rgba(30,64,175,0.7)',
                            }}
                          >
                            Team
                          </th>
                          <th
                            style={{ paddingBottom: '4px', textAlign: 'center' }}
                          >
                            P
                          </th>
                          <th
                            style={{ paddingBottom: '4px', textAlign: 'center' }}
                          >
                            W
                          </th>
                          <th
                            style={{ paddingBottom: '4px', textAlign: 'center' }}
                          >
                            D
                          </th>
                          <th
                            style={{ paddingBottom: '4px', textAlign: 'center' }}
                          >
                            L
                          </th>
                          <th
                            style={{ paddingBottom: '4px', textAlign: 'center' }}
                          >
                            GF
                          </th>
                          <th
                            style={{ paddingBottom: '4px', textAlign: 'center' }}
                          >
                            GA
                          </th>
                          <th
                            style={{ paddingBottom: '4px', textAlign: 'center' }}
                          >
                            GD
                          </th>
                          <th
                            style={{ paddingBottom: '4px', textAlign: 'center' }}
                          >
                            Pts
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams.map(team => (
                          <tr key={team.team}>
                            <td style={{ padding: '4px 0' }}>{team.team}</td>
                            <td
                              style={{
                                padding: '4px 0',
                                textAlign: 'center',
                              }}
                            >
                              {team.played}
                            </td>
                            <td
                              style={{
                                padding: '4px 0',
                                textAlign: 'center',
                              }}
                            >
                              {team.won}
                            </td>
                            <td
                              style={{
                                padding: '4px 0',
                                textAlign: 'center',
                              }}
                            >
                              {team.drawn}
                            </td>
                            <td
                              style={{
                                padding: '4px 0',
                                textAlign: 'center',
                              }}
                            >
                              {team.lost}
                            </td>
                            <td
                              style={{
                                padding: '4px 0',
                                textAlign: 'center',
                              }}
                            >
                              {team.gf}
                            </td>
                            <td
                              style={{
                                padding: '4px 0',
                                textAlign: 'center',
                              }}
                            >
                              {team.ga}
                            </td>
                            <td
                              style={{
                                padding: '4px 0',
                                textAlign: 'center',
                              }}
                            >
                              {team.gd}
                            </td>
                            <td
                              style={{
                                padding: '4px 0',
                                textAlign: 'center',
                                fontWeight: 600,
                              }}
                            >
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
            Click <strong>Load Dummy Cup matches</strong> to fetch games from
            the backend.
          </Sub>
        )}
