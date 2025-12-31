import React, { useEffect, useState } from 'react';

import TopBar from '../components/TopBar';
import NavDrawer from '../components/NavDrawer';

export default function Screen({
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
      <NavDrawer
  user={user}
  theme={theme}
  isOpen={!!user && !!navOpen}
  onClose={() => setNavOpen(false)}
  items={navItems}
  currentView={currentView}
  onNavigate={onNavigate}
  onLogout={onLogout}
/>

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
