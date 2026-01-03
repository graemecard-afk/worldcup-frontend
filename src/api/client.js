// src/api/client.js
// Phase 2 API seam.
// We move ONE function at a time into this file (starting with getStoredToken).

export function getStoredToken() {
  return localStorage.getItem('wc_token');
}
import { setAuthToken as legacySetAuthToken } from '../api.js';

// Still sourced from legacy module for now (we'll migrate these later).
export { apiGet, apiPost } from '../api.js';

export function setAuthToken(token) {
  legacySetAuthToken(token);
}

