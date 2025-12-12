import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, setAuthToken, getStoredToken } from './api.js';

const STADIUM_BG = '/wc-background.jpg';
const BALL_IMAGE =
  'https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=800';

// Simple pool code for now – front-end check only.
const POOL_CODE = 'GRAEME-2026';

export default function App() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    timezone: 'UTC',
    poolCode: '',
  });

  const [tournaments, setTournaments] = useState([]);
  const [currentTournament, setCurrentTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  // predictions: { [matchId]: { home: string, away: string, status: 'idle'|'dirty'|'saving'|'saved'|'error' } }
  const [predictions, setPredictions] = useState({});

  // On load, restore token and try /auth/me
  useEffect(() => {
    async function init() {
      const stored = getStoredToken();
      if (!stored) {
        setLoadingUser(false);
        return;
      }
      setAuthToken(stored);
      try {
        const me = await apiGet('/auth/me');
        setUser(me);
      } catch (err) {
        console.error(err);
        setAuthToken(null);
      } finally {
        setLoadingUser(false);
      }
    }
    init();
  }, []);

  function toggleTheme() {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');

    try {
      if (mode === 'register') {
        // Front-end pool code check
        if (form.poolCode.trim().toUpperCase() !== POOL_CODE.toUpperCase()) {
          setAuthError(
            'Incorrect pool code. Please check with Graeme for the right code.'
          );
          return;
        }

        const result = await apiPost('/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password,
          timezone: form.timezone || 'UTC',
        });
        setAuthToken(result.token);
        setUser(result.user);
      } else {
        const result = await apiPost('/auth/login', {
          email: form.email,
          password: form.password,
        });
        setAuthToken(result.token);
        setUser(result.user);
      }
    } catch (err) {
      console.error(err);
      setAuthError('Authentication failed – check your details.');
    }
  }

  async function loadTournamentAndMatches() {
    setLoadingData(true);
    setDataError('');
    try {
      const ts = await apiGet('/tournaments');
      setTournaments(ts);

      if (ts.length === 0) {
        setCurrentTournament(null);
        setMatches([]);
        setPredictions({});
        setLoadingData(false);
        return;
      }

      const first = ts[0];
      setCurrentTournament(first);

      const ms = await apiGet(`/matches/${first.id}`);
      setMatches(ms);

      // Try to load existing predictions; if endpoint not ready yet, fail silently
      try {
        const ps = await apiGet(`/predictions/${first.id}`);
        const map = {};
        ps.forEach(p => {
          map[p.match_id] = {
            home:
              p.home_goals === null || p.home_goals === undefined
                ? ''
                : String(p.home_goals),
            away:
              p.away_goals === null || p.away_goals === undefined
                ? ''
                : String(p.away_goals),
            status: 'saved',
          };
        });
        setPredictions(map);
      } catch (err) {
        console.error(
          'Failed to load existing predictions (OK if endpoint not implemented yet):',
          err
        );
        setPredictions({});
      }
    } catch (err) {
      console.error(err);
      setDataError('Failed to load tournament data.');
    } finally {
      setLoadingData(false);
    }
  }

  function handleLogout() {
    setAuthToken(null);
    setUser(null);
    setTournaments([]);
    setCurrentTournament(null);
    setMatches([]);
    setPredictions({});
  }

  function handleScoreChange(matchId, field, value) {
    // Keep it numeric or empty
    const clean =
      value === '' ? '' : value.replace(/[^\d]/g, '').slice(0, 2); // 0–99

    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        home: field === 'home' ? clean : prev[matchId]?.home ?? '',
        away: field === 'away' ? clean : prev[matchId]?.away ?? '',
        status: 'dirty',
      },
    }));
  }

  async function savePrediction(match) {
    if (!currentTournament) return;
    const entry = predictions[match.id] || {};
    const home =
      entry.home === '' || entry.home === undefined
        ? null
        : parseInt(entry.home, 10);
    const away =
      entry.away === '' || entry.away === undefined
        ? null
        : parseInt(entry.away, 10);

    setPredictions(prev => ({
      ...prev,
      [match.id]: {
        ...prev[match.id],
        status: 'saving',
      },
    }));

    try {
      await apiPost(`/predictions/${match.id}`, {
        tournamentId: currentTournament.id,
        homeGoals: home,
        awayGoals: away,
      });

      setPredictions(prev => ({
        ...prev,
        [match.id]: {
          ...prev[match.id],
          status: 'saved',
        },
      }));
    } catch (err) {
      console.error(err);
      setPredictions(prev => ({
        ...prev,
        [match.id]: {
          ...prev[match.id],
          status: 'error',
        },
      }));
    }
  }

  if (loadingUser) {
    return (
      <Screen
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      >
        <FrostedCard>
          <TitleRow />
          <Sub>Loading your session…</Sub>
        </FrostedCard>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen
        user={null}
        onLogout={null}
        theme={theme}
        onToggleTheme={toggleTheme}
      >
        <FrostedCard>
          <TitleRow />
          <Sub>Sign in to start making predictions with your mates.</Sub>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '18px',
              marginTop: '10px',
            }}
          >
            <TabButton
              active={mode === 'login'}
              onClick={() => {
                setMode('login');
                setAuthError('');
              }}
            >
              Login
            </TabButton>
            <TabButton
              active={mode === 'register'}
              onClick={() => {
                setMode('register');
                setAuthError('');
              }}
            >
              Register
            </TabButton>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ textAlign: 'left' }}>
            {mode === 'register' && (
              <Field label="Name">
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={e =>
                  setForm(f => ({ ...f, email: e.target.value }))
                }
                required
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={form.password}
                onChange={e =>
                  setForm(f => ({ ...f, password: e.target.value }))
                }
                required
              />
            </Field>
            {mode === 'register' && (
              <>
                <Field label="Timezone (for future local kick-off times)">
                  <input
                    type="text"
                    value={form.timezone}
                    onChange={e =>
                      setForm(f => ({ ...f, timezone: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Pool code (required to join this pool)">
                  <input
                    type="text"
                    value={form.poolCode}
                    onChange={e =>
                      setForm(f => ({ ...f, poolCode: e.target.value }))
                    }
                    required
                  />
                </Field>
              </>
            )}

            {authError && (
              <p style={{ color: '#fecaca', fontSize: '0.85rem' }}>
                {authError}
              </p>
            )}

            <button
              type="submit"
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '10px 12px',
                borderRadius: '999px',
                border: 'none',
                background:
                  'linear-gradient(135deg, #22c55e 0%, #16a34a 40%, #22c55e 100%)',
                color: '#0b1120',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(16,185,129,0.35)',
              }}
            >
              {mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </FrostedCard>
      </Screen>
    );
  }

  // Logged-in view
  return (
    <Screen
      user={user}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={toggleTheme}
    >
      <FrostedCard>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '14px',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <TitleRow />
            <Sub>Welcome, {user.name}</Sub>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid rgba(190,242,100,0.8)',
              boxShadow: '0 0 0 3px rgba(15,23,42,0.9)',
              flexShrink: 0,
            }}
          >
            <img
              src={BALL_IMAGE}
              alt="Football"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: '0.85rem',
                opacity: 0.9,
              }}
            >
              Get your predictions in before kick-off and see who tops the
              table in your pool.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={loadTournamentAndMatches}
            style={{
              padding: '8px 12px',
              borderRadius: '999px',
              border: 'none',
              background:
                'linear-gradient(135deg, #3b82f6 0%, #2563eb 40%, #3b82f6 100%)',
              color: '#f9fafb',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(37,99,235,0.45)',
            }}
          >
            Load Dummy Cup matches
          </button>
        </div>

        {loadingData && <Sub>Loading tournament data…</Sub>}
        {dataError && (
          <p style={{ color: '#fecaca', fontSize: '0.85rem' }}>{dataError}</p>
        )}

        {currentTournament && (
          <div style={{ textAlign: 'left', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Tournament</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
              {currentTournament.name} ({currentTournament.year})
            </p>
          </div>
        )}

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
                        {new Date(m.kickoff_utc).toISOString().slice(0, 16)} UTC
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
                            border:
                              '1px solid rgba(148,163,184,0.85)',
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
                            border:
                              '1px solid rgba(148,163,184,0.85)',
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

        {!loadingData && !dataError && matches.length === 0 && (
          <Sub>
            Click <strong>Load Dummy Cup matches</strong> to fetch games from
            the backend.
          </Sub>
        )}
      </FrostedCard>
    </Screen>
  );
}

// ===== Layout & UI helpers =====

function Screen({ children, user, onLogout, theme, onToggleTheme }) {
  const [navOpen, setNavOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const isDark = theme === 'dark';

  const bgImage = isDark
    ? `linear-gradient(120deg, rgba(15,23,42,0.9), rgba(8,47,73,0.85)), url(${STADIUM_BG})`
    : `linear-gradient(120deg, rgba(226,232,240,0.96), rgba(209,250,229,0.96)), url(${STADIUM_BG})`;

  const textColor = isDark ? '#e5e7eb' : '#0f172a';

  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0]?.toUpperCase())
        .slice(0, 2)
        .join('')
    : '';

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        backgroundImage: bgImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: textColor,
        paddingTop: '80px', // space for top bar
        position: 'relative',
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isDark
            ? 'rgba(0,0,0,0.55)'
            : 'rgba(15,23,42,0.12)',
          backdropFilter: 'blur(8px)',
          color: isDark ? '#fefefe' : '#0f172a',
          fontSize: '1.05rem',
          fontWeight: 600,
          letterSpacing: '0.03em',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          zIndex: 50,
          padding: '0 14px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user && (
            <button
              onClick={() => setNavOpen(o => !o)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '999px',
                border: 'none',
                background: isDark
                  ? 'rgba(15,23,42,0.9)'
                  : 'rgba(255,255,255,0.8)',
                color: isDark ? '#e5e7eb' : '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isDark
                  ? '0 3px 8px rgba(15,23,42,0.8)'
                  : '0 3px 8px rgba(148,163,184,0.6)',
              }}
              aria-label="Open navigation"
            >
              ☰
            </button>
          )}
        </div>

        <div
          style={{
            textAlign: 'center',
            flex: 1,
            pointerEvents: 'none',
          }}
        >
          <span style={{ whiteSpace: 'nowrap' }}>
            🏆 Graeme&apos;s World Cup Predictor Pool 2026
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onToggleTheme}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '999px',
              border: 'none',
              background: isDark
                ? 'rgba(15,23,42,0.9)'
                : 'rgba(255,255,255,0.9)',
              color: isDark ? '#fbbf24' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
            aria-label="Toggle colour theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setAvatarOpen(o => !o)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '999px',
                  border: '1px solid rgba(148,163,184,0.7)',
                  background: isDark
                    ? 'rgba(15,23,42,0.95)'
                    : 'rgba(255,255,255,0.95)',
                  color: isDark ? '#e5e7eb' : '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
                aria-label="User menu"
              >
                {initials || 'U'}
              </button>

              {avatarOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    background: isDark
                      ? 'rgba(15,23,42,0.95)'
                      : 'rgba(248,250,252,0.98)',
                    borderRadius: '10px',
                    border: '1px solid rgba(148,163,184,0.7)',
                    minWidth: '200px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    zIndex: 60,
                  }}
                >
                  <div
                    style={{
                      marginBottom: '6px',
                      opacity: 0.9,
                      paddingBottom: '4px',
                      borderBottom: '1px solid rgba(148,163,184,0.4)',
                    }}
                  >
                    Logged in as
                    <br />
                    <strong>{user.name}</strong>
                  </div>
                  <button
                    onClick={() => {
                      setAvatarOpen(false);
                      if (onLogout) onLogout();
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ef4444',
                      color: '#f9fafb',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SIDE NAV SHELL (for future multi-page nav) */}
      {user && navOpen && (
        <div
          style={{
            position: 'fixed',
            top: 60,
            left: 0,
            width: '220px',
            bottom: 0,
            background: isDark
              ? 'rgba(15,23,42,0.98)'
              : 'rgba(248,250,252,0.98)',
            borderRight: '1px solid rgba(148,163,184,0.5)',
            boxShadow: '4px 0 18px rgba(0,0,0,0.6)',
            padding: '12px 10px',
            zIndex: 40,
            fontSize: '0.9rem',
          }}
        >
          <div
            style={{
              marginBottom: '8px',
              fontWeight: 600,
              opacity: 0.85,
            }}
          >
            Navigation
          </div>
          {['Dashboard', 'Group Stage', 'Knockouts', 'Leaderboard', 'Rules'].map(
            item => (
              <div
                key={item}
                style={{
                  padding: '6px 8px',
                  borderRadius: '8px',
                  cursor: 'default',
                  opacity: 0.9,
                  marginBottom: '4px',
                  background:
                    item === 'Dashboard'
                      ? isDark
                        ? 'rgba(30,64,175,0.7)'
                        : 'rgba(191,219,254,0.9)'
                      : 'transparent',
                }}
              >
                {item}
              </div>
            )
          )}
          <p
            style={{
              marginTop: '10px',
              fontSize: '0.8rem',
              opacity: 0.7,
            }}
          >
            (Links are placeholders – we can wire them up once we add those
            pages.)
          </p>
        </div>
      )}

      {/* PAGE CONTENT */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function FrostedCard({ children }) {
  return (
    <div
      style={{
        background: 'rgba(15,23,42,0.82)',
        borderRadius: '18px',
        border: '1px solid rgba(148,163,184,0.4)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.7)',
        padding: '24px 28px',
        maxWidth: '520px',
        width: '100%',
        backdropFilter: 'blur(16px)',
      }}
    >
      {children}
    </div>
  );
}

function TitleRow() {
  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        marginBottom: '4px',
      }}
    >
      <span style={{ fontSize: '1.7rem' }}>🏆</span>
      <h1
        style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '0.03em',
        }}
      >
        World Cup Predictor
      </h1>
    </div>
  );
}

function Sub({ children }) {
  return (
    <p
      style={{
        margin: 0,
        marginBottom: '10px',
        fontSize: '0.9rem',
        opacity: 0.9,
      }}
    >
      {children}
    </p>
  );
}

function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      style={{
        flex: 1,
        padding: '8px 10px',
        borderRadius: '999px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.9rem',
        background: active ? '#3b82f6' : 'rgba(15,23,42,0.8)',
        color: active ? '#f9fafb' : '#e5e7eb',
        boxShadow: active
          ? '0 4px 12px rgba(59,130,246,0.5)'
          : '0 0 0 rgba(0,0,0,0)',
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label
      style={{
        display: 'block',
        marginBottom: '10px',
        fontSize: '0.85rem',
      }}
    >
      <span
        style={{
          display: 'block',
          marginBottom: '4px',
          opacity: 0.9,
        }}
      >
        {label}
      </span>
      {React.cloneElement(children, {
        style: {
          width: '100%',
          padding: '8px 10px',
          borderRadius: '8px',
          border: '1px solid rgba(148,163,184,0.7)',
          background: 'rgba(15,23,42,0.9)',
          color: '#e5e7eb',
          fontSize: '0.9rem',
        },
      })}
    </label>
  );
}
