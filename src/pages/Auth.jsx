import React from "react";



/**
 * Auth page — extracted from App.jsx verbatim.
 * UI-only. All state + handlers stay in App.jsx.
 */
function TabButton({ active, children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      style={{
        flex: 1,
        padding: "8px 10px",
        borderRadius: "999px",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "0.9rem",
        background: active ? "#3b82f6" : "rgba(15,23,42,0.8)",
        color: active ? "#f9fafb" : "#e5e7eb",
        boxShadow: active
          ? "0 4px 12px rgba(59,130,246,0.5)"
          : "0 0 0 rgba(0,0,0,0)",
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      {label ? (
        <div style={{ fontWeight: 700, marginBottom: 6, opacity: 0.95 }}>
          {label}
        </div>
      ) : null}

      {children}

      {hint ? (
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
          {hint}
        </div>
      ) : null}
    </label>
  );
}

export default function AuthPage({
  theme = "dark",
  mode,
  setMode,
  form,
  setForm,
  authError,
  setAuthError,
  onSubmit,
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "18px",
          marginTop: "10px",
        }}
      >
        <TabButton
          active={mode === "login"}
          onClick={() => {
            setMode("login");
            setAuthError("");
          }}
        >
          Login
        </TabButton>

        <TabButton
          active={mode === "register"}
          onClick={() => {
            setMode("register");
            setAuthError("");
          }}
        >
          Register
        </TabButton>
      </div>

      <form onSubmit={onSubmit} style={{ textAlign: "left" }}>
        {mode === "register" && (
          <Field label="Name">
            <input
              type="text"
              value={form.name}
              onChange={e =>
                setForm(f => ({ ...f, name: e.target.value }))
              }
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

        {mode === "register" && (
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
          <p style={{ color: "#fecaca", fontSize: "0.85rem" }}>
            {authError}
          </p>
        )}

        <button
          type="submit"
          style={{
            marginTop: "12px",
            width: "100%",
            padding: "10px 12px",
            borderRadius: "999px",
            border: "none",
            background:
              "linear-gradient(135deg, #22c55e 0%, #16a34a 40%, #22c55e 100%)",
            color: "#0b1120",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(16,185,129,0.35)",
          }}
        >
          {mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
    </>
  );
}
