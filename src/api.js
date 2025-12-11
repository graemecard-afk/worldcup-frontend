const API_BASE = 'https://worldcup-backend-s7ej.onrender.com';

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

export async function apiGet(path) {
  const res = await fetch(API_BASE + path, {
    headers: authToken
      ? { Authorization: `Bearer ${authToken}` }
      : {},
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `GET ${path} failed`);
  }
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `POST ${path} failed`);
  }
  return res.json();
}
