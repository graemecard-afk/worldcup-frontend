import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, setAuthToken, getStoredToken } from './api.js';
import LeaderboardTable from "./components/LeaderboardTable";
import AdminFinalizeMatchPanel from "./components/AdminFinalizeMatchPanel";
import LeaderboardPage from "./pages/Leaderboard";
import AuthPage from "./pages/Auth";

const STADIUM_BG = '/wc-background.png';
const BALL_IMAGE =
  'https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=800';

// Simple pool code for now – front-end check only.
const POOL_CODE = 'GRAEME-2026';

function isMatchLocked(match) {
  if (!match || !match.kickoff_utc) return false;

  const kickoff = new Date(match.kickoff_utc);
  if (Number.isNaN(kickoff.getTime())) return false;

  const now = new Date();
  const diffMs = kickoff.getTime() - now.getTime();

  // Lock from 2 hours before KO onwards
  return diffMs <= 2 * 60 * 60 * 1000;
}


function formatKickoff(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';

  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();

  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');

  return `${day}-${month}-${year} KO ${hours}:${minutes}`;
}

function computeGroupTables(matches, predictions) {
  const tables = {};

  for (const m of matches) {
    const pred = predictions[m.id];
    if (!pred) continue;

    const homeStr = pred.home;
    const awayStr = pred.away;

    if (
      homeStr === '' ||
      homeStr === undefined ||
      awayStr === '' ||
      awayStr === undefined
    ) {
      continue; // only include matches where both scores are set
    }

    const homeGoals = parseInt(homeStr, 10);
    const awayGoals = parseInt(awayStr, 10);

    if (Number.isNaN(homeGoals) || Number.isNaN(awayGoals)) continue;

    const groupKey = m.group_name || 'Group';

    if (!tables[groupKey]) {
      tables[groupKey] = {};
    }

    // Ensure both teams exist
    if (!tables[groupKey][m.home_team]) {
      tables[groupKey][m.home_team] = {
        team: m.home_team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
      };
    }
    if (!tables[groupKey][m.away_team]) {
      tables[groupKey][m.away_team] = {
        team: m.away_team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
      };
    }

    const home = tables[groupKey][m.home_team];
    const away = tables[groupKey][m.away_team];

    // Update basic stats
    home.played += 1;
    away.played += 1;

    home.gf += homeGoals;
    home.ga += awayGoals;
    home.gd = home.gf - home.ga;

    away.gf += awayGoals;
    away.ga += homeGoals;
    away.gd = away.gf - away.ga;

    // Result
    if (homeGoals > awayGoals) {
      home.won += 1;
      away.lost += 1;
      home.pts += 3;
    } else if (homeGoals < awayGoals) {
      away.won += 1;
      home.lost += 1;
      away.pts += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.pts += 1;
      away.pts += 1;
    }
  }

  // Convert inner maps to sorted arrays
  const result = {};
  for (const groupKey of Object.keys(tables)) {
    const teamsArr = Object.values(tables[groupKey]);

    teamsArr.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.team.localeCompare(b.team);
    });

    result[groupKey] = teamsArr;
  }

  return result;
}
function AdminFinalizeMatchPanel_OLD({ apiBaseUrl, token, tournamentId, matches, onAfterSave }) {
  const [matchId, setMatchId] = useState('');
  const [homeGoals, setHomeGoals] = useState('');
  const [awayGoals, setAwayGoals] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  



  async function saveResult() {
    setStatus('');

    if (!matchId) return setStatus('Pick a match ID.');
    if (homeGoals === '' || awayGoals === '') return setStatus('Enter both scores.');

    const hg = Number(homeGoals);
    const ag = Number(awayGoals);
    if (!Number.isInteger(hg) || !Number.isInteger(ag) || hg < 0 || ag < 0) {
      return setStatus('Scores must be whole numbers (0 or more).');
    }

   setSaving(true);
try {
  await apiPost(`/matches/${matchId}/result`, {
    home_goals: hg,
    away_goals: ag,
  });

  setStatus('✅ Saved. Updating points…');
  setHomeGoals('');
  setAwayGoals('');

  // Re-fetch matches + predictions so points appear
  if (onAfterSave) await onAfterSave();


  setStatus('✅ Saved. Points updated.');
} catch (e) {
  setStatus(`❌ Save failed: ${e.message}`);
} finally {
  setSaving(false);
}
}

  return (
    <div style={{ border: '1px solid rgba(0,0,0,0.15)', borderRadius: 10, padding: 12, margin: '12px 0' }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Admin: Finalise Match Result</div>

      <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>

        <label>
  Match
  <select
    value={matchId}
    onChange={(e) => setMatchId(e.target.value)}
    style={{ width: '100%' }}
  >
    <option value="">— Select a match —</option>
    {(matches || []).map((m) => (
      <option key={m.id} value={m.id}>
        {(m.home_team_name || m.home_team || 'Home')} vs {(m.away_team_name || m.away_team || 'Away')}
        {m.kickoff_utc ? ` — ${new Date(m.kickoff_utc).toLocaleString()}` : ''}
        {m.result_finalized ? ' ✅ finalised' : ''}
      </option>
    ))}
  </select>
</label>


        <div style={{ display: 'flex', gap: 8 }}>
          <label style={{ flex: 1 }}>
            Home goals
            <input value={homeGoals} onChange={(e) => setHomeGoals(e.target.value)} inputMode="numeric" />
          </label>
          <label style={{ flex: 1 }}>
            Away goals
            <input value={awayGoals} onChange={(e) => setAwayGoals(e.target.value)} inputMode="numeric" />
          </label>
        </div>

        <button onClick={saveResult} disabled={saving || !token }>
          {saving ? 'Saving…' : 'Save Result'}
        </button>
        
        {!token ? (
  <div style={{ fontSize: 12, opacity: 0.8 }}>
    Login required (no auth token found).
  </div>
) : null}


        {status ? <div style={{ whiteSpace: 'pre-wrap' }}>{status}</div> : null}
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [user, setUser] = useState(null);
  const ADMIN_EMAILS = [
  'graeme.card@gmail.com', // <-- replace with YOUR login email
];

const isAdmin = ADMIN_EMAILS.includes(
  (user?.email || '').toLowerCase()
);

  const [authError, setAuthError] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [currentView, setCurrentView] = useState('main');
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
  const groupTables = computeGroupTables(matches, predictions);

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
        const ps = await apiGet(`/predictions/tournament/${first.id}`);
        const map = {};
        ps.forEach(p => {
          map[p.match_id] = {
  home:
    p.predicted_home_goals === null || p.predicted_home_goals === undefined
      ? ''
      : String(p.predicted_home_goals),
  away:
    p.predicted_away_goals === null || p.predicted_away_goals === undefined
      ? ''
      : String(p.predicted_away_goals),
  status: 'saved',
  points: p.points ?? null,
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
async function refreshMatchesAndPredictions() {
  if (!currentTournament?.id) return;

  const ms = await apiGet(`/matches/${currentTournament.id}`);
  setMatches(ms || []);

  const ps = await apiGet(`/predictions/tournament/${currentTournament.id}`);
  const map = {};
  (ps || []).forEach(p => {
    map[p.match_id] = {
      home:
        p.predicted_home_goals === null || p.predicted_home_goals === undefined
          ? ''
          : String(p.predicted_home_goals),
      away:
        p.predicted_away_goals === null || p.predicted_away_goals === undefined
          ? ''
          : String(p.predicted_away_goals),
      status: 'saved',
      points: p.points ?? null,
    };
  });
  setPredictions(map);
}

  async function loadLeaderboard(tournamentId) {
  if (!tournamentId) return;
  try {
    const rows = await apiGet(`/leaderboard/${tournamentId}`);
    console.log('LEADERBOARD rows:', rows);

    return rows;
  } catch (err) {
    console.error(err);
    throw err;
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
        points: prev[matchId]?.points ?? null,
      },
    }));
  }

  async function savePrediction(match) {
    if (!currentTournament) return;
    const entry = predictions[match.id] || {};

    // If either field is empty, don't try to save yet
    if (
      entry.home === '' ||
      entry.home === undefined ||
      entry.away === '' ||
      entry.away === undefined
    ) {
      setPredictions(prev => ({
        ...prev,
        [match.id]: {
          ...prev[match.id],
          status: 'idle',
        },
      }));
      return;
    }

    const home = parseInt(entry.home, 10);
    const away = parseInt(entry.away, 10);

    if (Number.isNaN(home) || Number.isNaN(away)) {
      setPredictions(prev => ({
        ...prev,
        [match.id]: {
          ...prev[match.id],
          status: 'error',
        },
      }));
      return;
    }

    setPredictions(prev => ({
      ...prev,
      [match.id]: {
        ...prev[match.id],
        status: 'saving',
      },
    }));

    try {
      await apiPost(`/predictions/${match.id}`, {
        predicted_home_goals: home,
        predicted_away_goals: away,
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

const navigate = async (view) => {
  setCurrentView(view);

  if (view === 'leaderboard') {
    const rows = await loadLeaderboard(currentTournament?.id);
    setLeaderboardRows(rows || []);
  }
};

  if (loadingUser) {
    return (
      <Screen
  user={user}
  onLogout={handleLogout}
  theme={theme}
  onToggleTheme={toggleTheme}
  currentView={currentView}
  onNavigate={navigate}
>


        <FrostedCard theme={theme}>
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



        <FrostedCard theme={theme}>
          <TitleRow />
          <Sub>Sign in to start making predictions with your mates.</Sub>

<AuthPage
  theme={theme}
  mode={mode}
  setMode={setMode}
  form={form}
  setForm={setForm}
  authError={authError}
  setAuthError={setAuthError}
  onSubmit={handleAuthSubmit}
/>

        </FrostedCard>
      </Screen>
    );
  }
// ===== LEADERBOARD VIEW =====
if (currentView === 'leaderboard') {
  return (
    <Screen
  user={user}
  onLogout={handleLogout}
  theme={theme}
  onToggleTheme={toggleTheme}
  currentView={currentView}
  onNavigate={navigate}
>

      <FrostedCard theme={theme}>
        <TitleRow />
       <LeaderboardPage theme={theme} rows={leaderboardRows} />
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
  currentView={currentView}
  onNavigate={navigate}
>

      <FrostedCard theme={theme}>
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
              Get your predictions in at least 2h before kick-off, after which time they will be locked. See if you can outwit your mates!
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
    border: theme === 'dark'
      ? '1px solid rgba(30,64,175,0.7)'
      : '1px solid rgba(15,23,42,0.15)',
    background: theme === 'dark'
      ? 'rgba(15,23,42,0.85)'
      : 'rgba(255,255,255,0.95)',
              }}
            >
              

             {isAdmin && (
  <AdminFinalizeMatchPanel
    apiBaseUrl={''}
    token={getStoredToken()}
    tournamentId={currentTournament?.id}
    matches={matches}
    onAfterSave={refreshMatchesAndPredictions}
  />
)}



              
              {matches.map(m => {
                const pred = predictions[m.id] || {
                  home: '',
                  away: '',
                  status: 'idle',
                };
              
  const locked = isMatchLocked(m);

                
                return (
                  <div
                    key={m.id}
                    style={{
                      padding: '8px 10px',
                      borderBottom: theme === 'dark'
      ? '1px solid rgba(15,23,42,0.9)'
      : '1px solid rgba(0,0,0,0.08)',
    fontSize: '0.9rem',
    color: theme === 'dark' ? '#e5e7eb' : '#0f172a',
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
  <div>
    <strong>{m.home_team}</strong> vs <strong>{m.away_team}</strong>
  </div>
  {m.group_name ? (
    <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: 2 }}>
      {m.group_name}
    </div>
  ) : null}
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
                          disabled={locked}
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
                          disabled={locked}
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

{/* ACTUAL + POINTS (read-only) */}
<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Act:</span>
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '46px',
        padding: '4px 6px',
        borderRadius: '6px',
        border: '1px solid rgba(148,163,184,0.85)',
        background: 'rgba(148,163,184,0.25)',
        fontSize: '0.85rem',
        fontWeight: 600,
      }}
    >
      {m.result_finalized ? (m.result_home_goals ?? '–') : '–'}
    </span>
    <span>:</span>
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '46px',
        padding: '4px 6px',
        borderRadius: '6px',
        border: '1px solid rgba(148,163,184,0.85)',
        background: 'rgba(148,163,184,0.25)',
        fontSize: '0.85rem',
        fontWeight: 600,
      }}
    >
      {m.result_finalized ? (m.result_away_goals ?? '–') : '–'}
    </span>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Pts:</span>
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '52px',
        padding: '4px 6px',
        borderRadius: '6px',
        border: '1px solid rgba(148,163,184,0.85)',
        background: 'rgba(148,163,184,0.25)',
        fontSize: '0.85rem',
        fontWeight: 700,
      }}
    >
      {pred.points === 0 || typeof pred.points === 'number' ? pred.points : '–'}
    </span>
  </div>
</div>

                      
                      <StatusBadge status={locked ? 'locked' : pred.status} theme={theme} />

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
                      border: theme === 'dark'
      ? '1px solid rgba(30,64,175,0.7)'
      : '1px solid rgba(15,23,42,0.15)',
    background: theme === 'dark'
      ? 'rgba(15,23,42,0.9)'
      : 'rgba(255,255,255,0.96)',
    padding: '8px 10px',
    color: theme === 'dark' ? '#e5e7eb' : '#0f172a',
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
                             borderBottom: theme === 'dark'
      ? '1px solid rgba(30,64,175,0.7)'
      : '1px solid rgba(0,0,0,0.15)',
    color: theme === 'dark' ? '#e5e7eb' : '#0f172a',
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
      </FrostedCard>
    </Screen>
  );
}

// ===== Layout & UI helpers =====

function Screen({
  children,
  user,
  onLogout,
  theme,
  onToggleTheme,
  currentView,
  onNavigate,
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#0f172a';

  // robust mobile detection (updates on resize/rotate)
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 520);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

 // close popovers on view change (guarded to avoid instant close)
useEffect(() => {
  if (avatarOpen) setAvatarOpen(false);
  if (navOpen) setNavOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentView]);


  const bgImage = isDark
    ? `linear-gradient(120deg, rgba(15,23,42,0.9), rgba(8,47,73,0.85)), url(${STADIUM_BG})`
    : `url(${STADIUM_BG})`;

  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0]?.toUpperCase())
        .slice(0, 2)
        .join('')
    : '';

  const navItems = [
    { label: 'Dashboard', view: 'main' },
    { label: 'Group Stage', view: 'groups' },
    { label: 'Knockouts', view: 'knockouts' },
    { label: 'Leaderboard', view: 'leaderboard' },
    { label: 'Rules', view: 'rules' },
  ];

  const topBarBtnStyle = {
    height: 36,
    borderRadius: 10,
    border: '1px solid rgba(148,163,184,0.5)',
    background: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.9)',
    color: isDark ? '#e5e7eb' : '#0f172a',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '0 10px',
    fontSize: '0.95rem',
    fontWeight: 700,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        backgroundImage: bgImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: textColor,
        paddingTop: 72,
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
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(15,23,42,0.12)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          zIndex: 5000,
          pointerEvents: 'auto',
          padding: '0 14px',
          boxSizing: 'border-box',
          gap: 10,
        }}
      >
        {/* LEFT: hamburger on mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 60 }}>
          {user && (
            <button
              onClick={() => setNavOpen(o => !o)}
              style={{
  ...topBarBtnStyle,
  width: 40,
  padding: 0,
  position: 'relative',
  zIndex: 5001,
  pointerEvents: 'auto',
}}
              aria-label="Menu"
              type="button"
            >
              ☰
            </button>
          )}
        </div>

        {/* CENTER: title */}
        <div style={{ textAlign: 'center', flex: 1, pointerEvents: 'none' }}>
          <span style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>
            🏆 Graeme&apos;s World Cup Predictor Pool 2026
          </span>
        </div>

        {/* RIGHT: desktop controls OR nothing on mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120, justifyContent: 'flex-end' }}>
          {!isMobile && (
            <button
              onClick={onToggleTheme}
              style={{ ...topBarBtnStyle, width: 40, padding: 0 }}
              aria-label="Toggle colour theme"
              type="button"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          )}

          {user && !isMobile && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setAvatarOpen(o => !o)}
                style={{
                  ...topBarBtnStyle,
                  width: 40,
                  padding: 0,
                  borderRadius: 999,
                  border: '1px solid rgba(148,163,184,0.7)',
                }}
                aria-label="User menu"
                type="button"
              >
                {initials || 'U'}
              </button>

              {avatarOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 46,
                    right: 0,
                    background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.98)',
                    color: isDark ? '#e5e7eb' : '#0f172a',
                    borderRadius: 12,
                    border: '1px solid rgba(148,163,184,0.5)',
                    minWidth: 210,
                    boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                    padding: 10,
                    zIndex: 60,
                  }}
                >
                  <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: 8 }}>
                    Logged in as<br />
                    <strong>{user?.name || 'User'}</strong>
                  </div>

                  <button
                    onClick={() => {
                      setAvatarOpen(false);
                      onToggleTheme();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: '1px solid rgba(148,163,184,0.4)',
                      background: 'transparent',
                      color: 'inherit',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginBottom: 8,
                      fontWeight: 600,
                    }}
                    type="button"
                  >
                    {isDark ? 'Light mode' : 'Dark mode'}
                  </button>

                  <button
                    onClick={() => {
                      setAvatarOpen(false);
                      if (onLogout) onLogout();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: 'none',
                      background: '#ef4444',
                      color: '#f9fafb',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 700,
                    }}
                    type="button"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {user && navOpen && (
        <>
          {/* overlay */}
          <div
            onClick={() => setNavOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              zIndex: 55,
            }}
          />

          {/* drawer */}
          <div
            style={{
              position: 'fixed',
              top: 60,
              left: 0,
              bottom: 0,
              width: '78%',
              maxWidth: 320,
              background: isDark ? 'rgba(15,23,42,0.97)' : 'rgba(255,255,255,0.97)',
              color: isDark ? '#e5e7eb' : '#0f172a',
              borderRight: '1px solid rgba(148,163,184,0.25)',
              zIndex: 56,
              padding: 12,
              boxSizing: 'border-box',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Menu</div>

            {navItems.map(({ label, view }) => (
              <button
                key={view}
                onClick={() => {
                  if (onNavigate) onNavigate(view);
                  setNavOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: 8,
                  borderRadius: 12,
                  border: '1px solid rgba(148,163,184,0.25)',
                  background:
                    currentView === view
                      ? isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(15,23,42,0.08)'
                      : 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: currentView === view ? 800 : 600,
                }}
                type="button"
              >
                {label}
              </button>
            ))}

            <div style={{ height: 12 }} />

            <button
              onClick={() => {
                onToggleTheme();
                setNavOpen(false);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                marginBottom: 10,
                borderRadius: 12,
                border: '1px solid rgba(148,163,184,0.25)',
                background: 'transparent',
                color: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 700,
              }}
              type="button"
            >
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>

            <button
              onClick={() => {
                setNavOpen(false);
                if (onLogout) onLogout();
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 12,
                border: 'none',
                background: '#ef4444',
                color: '#f9fafb',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 800,
              }}
              type="button"
            >
              Log out
            </button>
          </div>
        </>
      )}

      {/* PAGE CONTENT */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}


function LeaderboardTable_OLD({ rows = [], theme = 'dark' }) {
  const isDark = theme === 'dark';

  // 1) Normalise + compute columns (knockouts are placeholder for now)
  const normalised = (rows || []).map(r => {
    const name = r?.name || r?.username || '—';
    const groupStagePoints = Number(r?.total_points ?? 0);
    const knockoutPoints = 0; // placeholder
    const grandTotal = groupStagePoints + knockoutPoints;

    return {
      ...r,
      _name: name,
      _groupStagePoints: groupStagePoints,
      _knockoutPoints: knockoutPoints,
      _grandTotal: grandTotal,
    };
  });

  // 2) Sort once (Group Stage desc, then name asc)
  normalised.sort((a, b) => {
    if (b._groupStagePoints !== a._groupStagePoints)
      return b._groupStagePoints - a._groupStagePoints;
    return String(a._name).localeCompare(String(b._name));
  });

  // 3) Rank once (competition ranking: 1,2,2,4 when ties)
  let lastPoints = null;
  let currentRank = 0;

  const ranked = normalised.map((r, idx) => {
    if (lastPoints === null || r._groupStagePoints !== lastPoints) {
      currentRank = idx + 1;
      lastPoints = r._groupStagePoints;
    }
    return {
      ...r,
      _rankGroupStage: currentRank,
      _overallRank: '', // placeholder for later
    };
  });

  return (
    <div style={{ marginTop: 14, textAlign: 'left' }}>
      <h3 style={{ margin: '10px 0 8px', fontSize: '1rem' }}>Leaderboard</h3>

      {ranked.length === 0 ? (
        <p style={{ marginTop: 0, opacity: 0.8 }}>No leaderboard data yet.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem',
          }}
        >
          <thead>
            <tr style={{ opacity: 0.85 }}>
              <th style={{ textAlign: 'left', padding: '6px 6px', width: 90 }}>
                Rank (GS)
              </th>
              <th style={{ textAlign: 'left', padding: '6px 6px' }}>Name</th>
              <th style={{ textAlign: 'right', padding: '6px 6px', width: 140 }}>
                Group Stage
              </th>
              <th style={{ textAlign: 'right', padding: '6px 6px', width: 120 }}>
                Knockouts
              </th>
              <th style={{ textAlign: 'right', padding: '6px 6px', width: 130 }}>
                Grand Total
              </th>
              <th style={{ textAlign: 'right', padding: '6px 6px', width: 120 }}>
                Overall Rank
              </th>
            </tr>
          </thead>

          <tbody>
            {ranked.map((r, idx) => (
              <tr
                key={r.user_id || `${r._name}-${idx}`}
                style={{
                  borderTop: isDark
                    ? '1px solid rgba(148,163,184,0.25)'
                    : '1px solid rgba(15,23,42,0.12)',
                }}
              >
                <td style={{ padding: '8px 6px' }}>{r._rankGroupStage}</td>
                <td style={{ padding: '8px 6px' }}>{r._name}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700 }}>
                  {r._groupStagePoints}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                  {r._knockoutPoints}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700 }}>
                  {r._grandTotal}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right', opacity: 0.7 }}>
                  {r._overallRank}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


function StatusBadge({ status, theme }) {
  const isDark = theme === 'dark';

  if (!status || status === 'idle') return null;

  let label = '';
  let bg = '';
  let border = '';
  let text = '';

  if (status === 'saved') {
    label = 'Saved';
    bg = isDark ? 'rgba(22,163,74,0.18)' : 'rgba(22,163,74,0.08)';
    border = isDark ? 'rgba(34,197,94,0.6)' : 'rgba(22,163,74,0.5)';
    text = isDark ? '#bbf7d0' : '#166534';
  } else if (status === 'saving') {
    label = 'Saving…';
    bg = isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.08)';
    border = isDark ? 'rgba(245,158,11,0.7)' : 'rgba(217,119,6,0.5)';
    text = isDark ? '#facc15' : '#92400e';
  } else if (status === 'dirty') {
    label = 'Changed';
    bg = isDark ? 'rgba(59,130,246,0.24)' : 'rgba(59,130,246,0.08)';
    border = isDark ? 'rgba(59,130,246,0.8)' : 'rgba(37,99,235,0.55)';
    text = isDark ? '#bfdbfe' : '#1d4ed8';
  } else if (status === 'error') {
    label = 'Error';
    bg = isDark ? 'rgba(248,113,113,0.2)' : 'rgba(239,68,68,0.08)';
    border = isDark ? 'rgba(248,113,113,0.8)' : 'rgba(220,38,38,0.55)';
    text = isDark ? '#fecaca' : '#b91c1c';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '999px',
        fontSize: '0.7rem',
        fontWeight: 600,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: text,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}



function FrostedCard({ children, theme = 'dark' }) {
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        background: isDark
          ? 'rgba(15,23,42,0.82)'
          : 'rgba(255,255,255,0.98)',
        borderRadius: '18px',
        border: isDark
          ? '1px solid rgba(148,163,184,0.4)'
          : '1px solid rgba(15,23,42,0.18)',
        boxShadow: isDark
          ? '0 18px 50px rgba(0,0,0,0.7)'
          : '0 18px 40px rgba(15,23,42,0.35)',
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
