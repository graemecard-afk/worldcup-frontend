// src/api.js

// Prefer an env var if present, otherwise fall back to the current hard-coded Render URL.
// (Vercel env var name for Vite is VITE_API_BASE_URL)
const API_BASE =
  (import.meta.env?.VITE_API_BASE_URL || 'https://worldcup-backend-s7ej.onrender.com')
    .replace(/\/$/, ''); // remove trailing slash if present

let authToken = null;

export function setAuthToken(token) {
  authToken = token;

  if (token) {
    localStorage.setItem('wc_token', token);
  } else {
    localStorage.removeItem('wc_token');
  }
}

export function getStoredToken() {
  return localStorage.getItem('wc_token');
}

async function handleError(res, method, path) {
  const text = await res.text().catch(() => '');
  // Keep the message short but useful
  const msg = text || `${method} ${path} failed (${res.status})`;
  throw new Error(msg);
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  });

  if (!res.ok) await handleError(res, 'GET', path);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });

  if (!res.ok) await handleError(res, 'POST', path);
  return res.json();
}
