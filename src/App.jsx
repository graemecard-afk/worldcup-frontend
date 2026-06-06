import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, setAuthToken, getStoredToken } from './api/client.js';
import LeaderboardTable from "./components/LeaderboardTable";
import AdminFinalizeMatchPanel from "./components/AdminFinalizeMatchPanel";
import AdminKnockoutTeamPanel from "./components/AdminKnockoutTeamPanel";
import AdminUserPaymentsPanel from "./components/AdminUserPaymentsPanel";
import LeaderboardPage from "./pages/Leaderboard";
import AuthPage from "./pages/Auth";
import NavDrawer from './components/NavDrawer';
import Screen from './layout/Screen';
import { TEAM_FLAGS } from './constants/teamFlags';
import MatchPhaseToggle from "./components/MatchPhaseToggle";
import KnockoutBracket from "./components/KnockoutBracket";
import { buildActualPropagatedTeams } from "./utils/KnockoutPropagation";
import RulesPage from "./pages/RulesPage";
import PaymentPage from "./pages/PaymentPage";



const STADIUM_BG = '/wc-background.png';
const BALL_IMAGE =
  'https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=800';

// Simple pool code for now – front-end check only.
const POOL_CODE = 'GRAEME-2026';

function isMatchLocked(match) {
  if (!match) return false;

  // If admin has finalized the result, always lock it.
  if (match.result_finalized) return true;

  if (!match.kickoff_utc) return false;

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

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

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
  'graeme.card@gmail.com',
  'graeme.card@gdc.govt.nz', // <-- replace with YOUR login email
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
  const [matchPhase, setMatchPhase] = useState('group');
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  



  // predictions: { [matchId]: { home: string, away: string, status: 'idle'|'dirty'|'saving'|'saved'|'error' } }
  const [predictions, setPredictions] = useState({});
  const visibleMatches = matches.filter(m =>
  matchPhase === 'group'
    ? String(m.stage || '').startsWith('Matchday')
    : !String(m.stage || '').startsWith('Matchday')
);

    const actualPropagatedTeams =
  matchPhase === 'knockout'
    ? buildActualPropagatedTeams(visibleMatches)
    : {};
const groupTables = computeGroupTables(
  matchPhase === 'group' ? visibleMatches : [],
  predictions
);

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
    function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');

    try {
      if (mode === 'register') {
                  if (!isValidEmail(form.email)) {
            setAuthError('Please enter a valid email address.');
            return;
          }
                    if ((form.password || '').length < 8) {
            setAuthError('Password must be at least 8 characters long.');
            return;
          }
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
      advancing: p.predicted_advancing_team || '',
  status: 'saved',
  points: p.points ?? null,
          };
        });



        
        setPredictions(map);
                  const leaderboard = await loadLeaderboard(first.id);
          setLeaderboardRows(leaderboard || []);
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
          advancing: p.predicted_advancing_team || '',
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
    const clean =
      value === '' ? '' : value.replace(/[^\d]/g, '').slice(0, 2);

    setPredictions(prev => {
      const existing = prev[matchId] || {};

      return {
        ...prev,
        [matchId]: {
          ...existing,
          home: field === 'home' ? clean : existing.home ?? '',
          away: field === 'away' ? clean : existing.away ?? '',
          champion: field === 'champion' ? value : existing.champion ?? '',
          thirdPlace: field === 'thirdPlace' ? value : existing.thirdPlace ?? '',
          status: 'dirty',
          points: existing.points ?? null,
        },
      };
    });
  }
function handleAdvancingChange(matchId, value) {
  setPredictions(prev => ({
    ...prev,
    [matchId]: {
      ...prev[matchId],
      advancing: value,
      status: 'dirty',
      points: prev[matchId]?.points ?? null,
    },
  }));
}
  async function savePrediction(match, override = {}) {
    if (!currentTournament) return;
    const entry = {
  ...(predictions[match.id] || {}),
  ...override,
};

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
    const advancing = entry.advancing || '';
          if (matchPhase === 'knockout' && home === away && !advancing) {
  setPredictions(prev => ({
    ...prev,
    [match.id]: {
      ...prev[match.id],
      status: 'dirty',
    },
  }));
  return;
}

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
        predicted_advancing_team: advancing,
        predicted_home_team: entry.predictedHomeTeam || null,
        predicted_away_team: entry.predictedAwayTeam || null,
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
  stadiumBg={STADIUM_BG}
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
  stadiumBg={STADIUM_BG}
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
  stadiumBg={STADIUM_BG}
>

      <FrostedCard theme={theme}>
        <TitleRow />
       <LeaderboardPage theme={theme} rows={leaderboardRows} />
      </FrostedCard>
    </Screen>
  );
}
// ===== PAYMENT DETAILS VIEW =====
if (currentView === 'payments') {
  return (
    <Screen
      user={user}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={toggleTheme}
      currentView={currentView}
      onNavigate={navigate}
      stadiumBg={STADIUM_BG}
    >
      <FrostedCard theme={theme}>
        <TitleRow />
        <PaymentPage />
      </FrostedCard>
    </Screen>
  );
}
// ===== RULES VIEW =====
if (currentView === 'rules') {
  return (
    <Screen
      user={user}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={toggleTheme}
      currentView={currentView}
      onNavigate={navigate}
      stadiumBg={STADIUM_BG}
    >
      <FrostedCard theme={theme}>
        <TitleRow />
       <RulesPage />
      </FrostedCard>
    </Screen>
  );
}

  // Logged-in view
       const myLeaderboardRow = (leaderboardRows || []).find(
      r => r.user_id === user?.id
    );

    const myGroupStagePoints = Number(myLeaderboardRow?.group_stage_points ?? 0);
    const myKnockoutPoints = Number(myLeaderboardRow?.knockout_points ?? 0);
    const myTotalPoints = Number(
      myLeaderboardRow?.total_points ?? myGroupStagePoints + myKnockoutPoints
    );

  const rankedLeaderboardRows = [...(leaderboardRows || [])]
    .map(r => ({
      ...r,
      _points: Number(r?.total_points ?? 0),
    }))
    .sort((a, b) => {
      if (b._points !== a._points) return b._points - a._points;
      return String(a?.name || '').localeCompare(String(b?.name || ''));
    });

  let myRankLabel = '—';
  let lastRankPoints = null;
  let currentRank = 0;

  rankedLeaderboardRows.forEach((row, idx) => {
    if (lastRankPoints === null || row._points !== lastRankPoints) {
      currentRank = idx + 1;
      lastRankPoints = row._points;
    }

    if (row.user_id === user?.id) {
      myRankLabel = String(currentRank);
    }
  });
  return (
    <Screen
  user={user}
  onLogout={handleLogout}
  theme={theme}
  onToggleTheme={toggleTheme}
  currentView={currentView}
  onNavigate={navigate}
  stadiumBg={STADIUM_BG}
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
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '10px',
              marginBottom: '16px',
              padding: '12px',
              borderRadius: '12px',
              border: theme === 'dark'
                ? '1px solid rgba(148,163,184,0.35)'
                : '1px solid rgba(15,23,42,0.15)',
              background: theme === 'dark'
                ? 'rgba(15,23,42,0.72)'
                : 'rgba(255,255,255,0.88)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>Group Stage</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{myGroupStagePoints}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>Knockouts</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{myKnockoutPoints}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>Total</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{myTotalPoints}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>Rank</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{myRankLabel}</div>
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
                        <p
              style={{
                marginTop: '8px',
                marginBottom: 0,
                fontSize: '0.8rem',
                color: '#fbbf24',
                fontWeight: 600,
              }}
            >
              ⚠️ Knockout predictions are currently under development and testing.
              Any knockout selections entered before official release may be
              changed, reset, or overwritten without notice.
            </p>
          </div>
        </div>

                <MatchPhaseToggle
  matchPhase={matchPhase}
  onLoadGroup={() => {
    setMatchPhase('group');
    loadTournamentAndMatches();
  }}
     onLoadKnockout={() => {
      setMatchPhase('knockout');
      loadTournamentAndMatches();
    }}
          onLoadAdmin={
        isAdmin
          ? () => {
              setMatchPhase('admin');
              loadTournamentAndMatches();
            }
          : null
      }
  />

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

        {visibleMatches.length > 0 && (
          <div style={{ textAlign: 'left', marginTop: '8px' }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1rem' }}>
              {matchPhase === 'group'
  ? 'Your group stage predictions'
  : 'Your knockout phase predictions'}
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
                            {matchPhase === 'group' && isAdmin && (
                <div
                  style={{
                    marginBottom: '12px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(148,163,184,0.35)',
                  }}
                >
                  <AdminFinalizeMatchPanel
                    apiBaseUrl={''}
                    token={getStoredToken()}
                    tournamentId={currentTournament?.id}
                    matches={visibleMatches}
                    actualPropagatedTeams={actualPropagatedTeams}
                    onAfterSave={refreshMatchesAndPredictions}
                  />
                </div>
              )}
            </p>
                          {matchPhase === 'admin' ? (
 <div
  style={{
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid rgba(148,163,184,0.35)',
  }}
>
  <AdminKnockoutTeamPanel
    matches={visibleMatches}
    onAfterSave={refreshMatchesAndPredictions}
  />

  <AdminUserPaymentsPanel />
</div>
) : matchPhase === 'knockout' ? (
                <>
                  <KnockoutBracket
                    matches={visibleMatches}
                    predictions={predictions}
                    theme={theme}
                    formatKickoff={formatKickoff}
                    isMatchLocked={isMatchLocked}
                    handleScoreChange={handleScoreChange}
                    handleAdvancingChange={handleAdvancingChange}
                    savePrediction={savePrediction}
                    StatusBadge={StatusBadge}
                  />

                  {isAdmin && (
                    <AdminFinalizeMatchPanel
                      apiBaseUrl={''}
                      token={getStoredToken()}
                      tournamentId={currentTournament?.id}
                      matches={visibleMatches}
                      actualPropagatedTeams={actualPropagatedTeams}
                      onAfterSave={refreshMatchesAndPredictions}
                    />
                  )}
                </>
              ) : (
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
 
              {visibleMatches.map(m => {
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
    <strong><img src={TEAM_FLAGS[m.home_team]} alt="" style={{ width: '16px', height: '12px', objectFit: 'cover', marginRight: '6px', verticalAlign: 'middle' }} />{m.home_team}</strong> vs <strong><img src={TEAM_FLAGS[m.away_team]} alt="" style={{ width: '16px', height: '12px', objectFit: 'cover', marginRight: '6px', verticalAlign: 'middle' }} />{m.away_team}</strong>
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
            )}
          </div>
        )}

        {matchPhase === 'group' && visibleMatches.length > 0 && (
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
                {Object.entries(groupTables)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([groupName, teams]) => (
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
                            <td style={{ padding: '4px 0' }}><img src={TEAM_FLAGS[team.team]} alt="" style={{ width: '16px', height: '12px', objectFit: 'cover', marginRight: '6px', verticalAlign: 'middle' }} />{team.team}</td>
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
            Click <strong>Load Group Stage matches</strong> to fetch games from
            the server.
          </Sub>
        )}
      </FrostedCard>
    </Screen>
  );
}

// ===== Layout & UI helpers =====



function LeaderboardTable_OLD({ rows = [], theme = 'dark' }) {
  const isDark = theme === 'dark';

  // 1) Normalise + compute columns (knockouts are placeholder for now)
  const normalised = (rows || []).map(r => {
    const name = r?.name || r?.username || '—';
          const groupStagePoints = Number(r?.group_stage_points ?? 0);
      const knockoutPoints = Number(r?.knockout_points ?? 0);
      const grandTotal = Number(r?.total_points ?? groupStagePoints + knockoutPoints);

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
