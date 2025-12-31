// src/components/NavDrawer.jsx
import React, { useEffect } from 'react';

/**
 * Pure UI drawer. No internal state.
 *
 * Props:
 * - user: object|null
 * - theme: 'dark' | 'light' (or whatever you use)
 * - isOpen: boolean
 * - onClose: () => void
 * - items: Array<{ label: string, view: string }>
 * - currentView: string
 * - onNavigate: (view: string) => void
 * - onLogout: () => void
 */
export default function NavDrawer({
  user,
  theme,
  isOpen,
  onClose,
  items = [],
  currentView,
  onNavigate,
  onLogout,
  onToggleTheme,
}) {
  // ESC to close (UI-only convenience; safe)
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = e => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!user || !isOpen) return null;

  const isDark = theme === 'dark';

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 9998,
  };

  const drawerStyle = {
    position: 'fixed',
    top: 60, // assume TopBar height ~60px (matches your current layout)
    left: 0,
    width: 280,
    height: 'calc(100vh - 60px)',
    background: isDark ? 'rgba(20,20,24,0.98)' : 'rgba(255,255,255,0.98)',
    borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
    zIndex: 9999,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    overflowY: 'auto',
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.55)' : '0 10px 30px rgba(0,0,0,0.20)',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingBottom: 10,
    borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
  };

  const userStyle = {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
    overflow: 'hidden',
  };

  const nameStyle = {
    fontWeight: 700,
    fontSize: 14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const emailStyle = {
    opacity: 0.75,
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const closeBtnStyle = {
    border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
    background: 'transparent',
    color: 'inherit',
    borderRadius: 10,
    padding: '6px 10px',
    cursor: 'pointer',
  };

  const navListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    paddingTop: 8,
  };

  const navItemStyle = active => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: '10px 10px',
    borderRadius: 12,
    cursor: 'pointer',
    userSelect: 'none',
    background: active
      ? isDark
        ? 'rgba(255,255,255,0.10)'
        : 'rgba(0,0,0,0.08)'
      : 'transparent',
    border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.08)',
  });

  const footerStyle = {
    marginTop: 'auto',
    paddingTop: 10,
    borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  const logoutBtnStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    cursor: 'pointer',
    border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(0,0,0,0.14)',
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    color: 'inherit',
    fontWeight: 600,
  };

  return (
    <>
      {/* Overlay: click to close */}
      <div
        style={overlayStyle}
        onClick={() => onClose?.()}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside style={drawerStyle} role="navigation" aria-label="App navigation">
        <div style={headerStyle}>
          <div style={userStyle}>
            <div style={nameStyle}>{user?.username || user?.name || 'Player'}</div>
            <div style={emailStyle}>{user?.email || ''}</div>
          </div>

          <button type="button" style={closeBtnStyle} onClick={() => onClose?.()}>
            ✕
          </button>
        </div>

        <div style={navListStyle}>
          <button
  type="button"
  onClick={() => onToggleTheme?.()}
  style={{
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: theme === 'dark' ? '#f9fafb' : '#0f172a',
    cursor: 'pointer',
    fontWeight: 700,
    marginBottom: 12,
  }}
>
  {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
</button>

          {items.map(it => {
            const active = it.view === currentView;
            return (
              <div
                key={it.view}
                style={navItemStyle(active)}
                onClick={() => {
                  onNavigate?.(it.view);
                  onClose?.();
                }}
              >
                <span style={{ fontWeight: active ? 700 : 600 }}>{it.label}</span>
                {active ? <span style={{ opacity: 0.8 }}>•</span> : null}
              </div>
            );
          })}
        </div>

        <div style={footerStyle}>
          <button
            type="button"
            style={logoutBtnStyle}
            onClick={() => {
              onClose?.();
              onLogout?.();
            }}
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
