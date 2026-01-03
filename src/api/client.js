// src/api/client.js
// Phase 2 API seam.


const API_BASE =
  (import.meta.env?.VITE_API_BASE_URL || 'https://worldcup-backend-s7ej.onrender.com')
    .replace(/\/$/, '');

export function getStoredToken() {
  return localStorage.getItem('wc_token');
}

async function handleError(res, method, path) {
  const text = await res.text().catch(() => '');
  const msg = text || `${method} ${path} failed (${res.status})`;
  throw new Error(msg);
}

export async function apiGet(path) {
  const token = getStoredToken();

  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) await handleError(res, 'GET', path);
  return res.json();
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('wc_token', token);
  } else {
    localStorage.removeItem('wc_token');
  }
}

export async function apiPost(path, body) {
  const token = getStoredToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });

  if (!res.ok) await handleError(res, 'POST', path);
  return res.json();
}

