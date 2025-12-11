import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, setAuthToken, getStoredToken } from './api.js';

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
        <Card>
          <Title>World Cup Predictor</Title>
          <Sub>Loading your session…</Sub>
        </Card>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <Card>
          <Title>World Cup Predictor</Title>
          <Sub>Sign in to start making predictions</Sub>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
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
              <Field label="Timezone (for future features)">
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
              <p style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>
                {authError}
              </p>
            )}

            <button
              type="submit"
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </Card>
      </Screen>
    );
  }

  // Logged-in view
  return (
    <Screen>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <Title>World Cup Predictor</Title>
            <Sub>Welcome, {user.name}</Sub>
          </div>
          <button
            onClick={handleLogout}
            style={{
              alignSelf: 'flex-start',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #4b5563',
              background: 'transparent',
              color: '#e5e7eb',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Log out
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={loadTournamentAndMatches}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: '#10b981',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Load Dummy Cup matches
          </button>
        </div>

        {loadingData && <Sub>Loading tournament data…</Sub>}
        {dataError && (
          <p style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{dataError}</p>
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
                borderRadius: '8px',
                border: '1px solid #1f2933',
              }}
            >
              {matches.map(m => (
                <div
                  key={m.id}
                  style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid #111827',
                    fontSize: '0.9rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    <strong>{m.home_team}</strong> vs{' '}
                    <strong>{m.away_team}</strong>
                    {m.group_name ? ` – ${m.group_name}` : ''}
                  </span>
                  <span style={{ opacity: 0.8 }}>
                    {new Date(m.kickoff_utc).toISOString().slice(0, 16)} UTC
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loadingData && !dataError && tournaments.length === 0 && (
          <Sub>Click “Load Dummy Cup matches” to fetch data from the backend.</Sub>
        )}
      </Card>
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
        background: '#020617',
        color: '#e5e7eb',
        padding: '16px',
      }}
    >
      {children}
    </div>
  );
}

function Card({ children }) {
  return (
    <div
      style={{
        background: '#020617',
        borderRadius: '16px',
        border: '1px solid #1f2933',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        padding: '24px 28px',
        maxWidth: '520px',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

function Title({ children }) {
  return (
    <h1
      style={{
        margin: 0,
        marginBottom: '6px',
        fontSize: '1.6rem',
        fontWeight: 700,
      }}
    >
      {children}
    </h1>
  );
}

function Sub({ children }) {
  return (
    <p
      style={{
        margin: 0,
        marginBottom: '10px',
        fontSize: '0.9rem',
        opacity: 0.85,
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
        background: active ? '#3b82f6' : '#0b1120',
        color: active ? '#fff' : '#e5e7eb',
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem' }}>
      <span style={{ display: 'block', marginBottom: '4px', opacity: 0.9 }}>
        {label}
      </span>
      {React.cloneElement(children, {
        style: {
          width: '100%',
          padding: '8px 10px',
          borderRadius: '8px',
          border: '1px solid #4b5563',
          background: '#020617',
          color: '#e5e7eb',
          fontSize: '0.9rem',
        },
      })}
    </label>
  );
}
