import React from "react";

/**
 * Auth page (UI only).
 * App.jsx keeps the logic: mode state, form state, submit handler, error state.
 *
 * Props:
 * - theme: 'dark' | 'light'
 * - mode: 'login' | 'register'
 * - setMode: fn(nextMode)
 * - form: object (e.g. { username, password })
 * - setForm: fn(nextForm)
 * - authError: string
 * - onSubmit: fn(event)
 */
export default function Auth({
  theme = "dark",
  mode = "login",
  setMode,
  form,
  setForm,
  authError,
  onSubmit,
}) {
  const isDark = String(theme).toLowerCase() === "dark";

  const tabStyle = isActive => ({
    padding: "8px 12px",
    borderRadius: 10,
    border: `1px solid ${
      isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)"
    }`,
    background: isActive
      ? isDark
        ? "rgba(255,255,255,0.12)"
        : "rgba(0,0,0,0.06)"
      : "transparent",
    cursor: "pointer",
    fontWeight: 700,
  });

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${
      isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)"
    }`,
    background: isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.9)",
    color: isDark ? "white" : "black",
    outline: "none",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${
      isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)"
    }`,
    background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
    color: isDark ? "white" : "black",
    cursor: "pointer",
    fontWeight: 800,
    marginTop: 10,
  };

  const activeLogin = mode === "login";
  const activeRegister = mode === "register";

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          style={tabStyle(activeLogin)}
          onClick={() => setMode && setMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          style={tabStyle(activeRegister)}
          onClick={() => setMode && setMode("register")}
        >
          Register
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>
              Username
            </div>
            <input
              style={inputStyle}
              value={form?.username || ""}
              onChange={e => setForm && setForm({ ...(form || {}), username: e.target.value })}
              autoComplete="username"
            />
          </label>

          <label>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>
              Password
            </div>
            <input
              style={inputStyle}
              type="password"
              value={form?.password || ""}
              onChange={e => setForm && setForm({ ...(form || {}), password: e.target.value })}
              autoComplete={activeRegister ? "new-password" : "current-password"}
            />
          </label>

          {authError ? (
            <div style={{ fontSize: 13, opacity: 0.95 }}>
              {authError}
            </div>
          ) : null}

          <button type="submit" style={buttonStyle}>
            {activeRegister ? "Create account" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
