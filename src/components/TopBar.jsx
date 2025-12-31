import React from 'react';

export default function TopBar({
  user,
  theme,
  onToggleTheme,
  onToggleNav,
  avatarOpen,
  setAvatarOpen,
}) {
  const isDark = theme === 'dark';

  return (
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
        padding: '0 16px',
        background: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(0,0,0,0.08)',
        zIndex: 100,
      }}
    >
      {/* Left: hamburger + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user && (
          <button
            onClick={onToggleNav}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: 'inherit',
            }}
            type="button"
          >
            ☰
          </button>
        )}

        <div style={{ fontWeight: 800 }}>World Cup Predictor</div>
      </div>

      {/* Right: theme + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onToggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 18,
          }}
          type="button"
        >
          {isDark ? '🌙' : '☀️'}
        </button>

        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setAvatarOpen(!avatarOpen)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.3)'
                  : '1px solid rgba(0,0,0,0.3)',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: 700,
              }}
              type="button"
            >
              {user.username?.[0] || 'U'}
            </button>

            {avatarOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 40,
                  background: isDark ? '#0f172a' : '#ffffff',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.1)'
                    : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 12,
                  padding: 10,
                  zIndex: 200,
                  minWidth: 120,
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
                  {user.email}
                </div>
                <div style={{ fontWeight: 700 }}>{user.username}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
