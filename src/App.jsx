import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, setAuthToken, getStoredToken } from './api.js';

const STADIUM_BG =
  'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1600'; // generic stadium
const BALL_IMAGE =
  'https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=800';

export default function App() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    timezone: 'UTC',
  });

  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

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

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');

    try {
      if (mode === 'register') {
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
      if (ts.length > 0) {
        const first = ts[0];
        const ms = await apiGet(`/matches/${first.id}`);
        setMatches(ms);
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
    setMatches([]);
  }

  if (loadingUser) {
    return (
      <Screen>
        <FrostedCard>
          <TitleRow />
          <Sub>Loading your session…</Sub>
        </FrostedCard>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
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
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
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
              <Field label="Timezone (for future local kick-off times)">
                <input
                  type="text"
                  value={form.timezone}
                  onChange={e =>
                    setForm(f => ({ ...f, timezone: e.target.value }))
                  }
                />
              </Field>
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
    <Screen>
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
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 10px',
              borderRadius: '999px',
              border: '1px solid rgba(148,163,184,0.6)',
              background: 'rgba(15,23,42,0.7)',
              color: '#e5e7eb',
              cursor: 'pointer',
              fontSize: '0.8rem',
              backdropFilter: 'blur(6px)',
            }}
          >
            Log out
          </button>
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

        {tournaments.length > 0 && (
          <div style={{ textAlign: 'left', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Tournament</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
              {tournaments[0].name} ({tournaments[0].year})
            </p>
          </div>
        )}

        {matches.length > 0 && (
          <div style={{ textAlign: 'left', marginTop: '8px' }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1rem' }}>Matches</h3>
            <div
              style={{
                maxHeight: '260px',
                overflowY: 'auto',
                borderRadius: '12px',
                border: '1px solid rgba(30,64,175,0.7)',
                background: 'rgba(15,23,42,0.85)',
              }}
            >
              {matches.map(m => (
                <div
                  key={m.id}
                  style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid rgba(15,23,42,0.9)',
                    fontSize: '0.9rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '10px',
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
              ))}
            </div>
          </div>
        )}

        {!loadingData && !dataError && tournaments.length === 0 && (
          <Sub>
            Click <strong>Load Dummy Cup matches</strong> to fetch games from
            the backend.
          </Sub>
        )}
      </FrostedCard>
    </Screen>
  );
}

function Screen({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `linear-gradient(120deg, rgba(15,23,42,0.9), rgba(8,47,73,0.85)), url(${STADIUM_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#e5e7eb',
        padding: '16px',
      }}
    >
      {children}
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
