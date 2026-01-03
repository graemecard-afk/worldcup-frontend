// src/api/client.js
// Shim layer for Phase 2 refactor.
// For now, this simply re-exports the existing API helpers from src/api.js.
// We will move implementations here later, one function per commit.

export { apiGet, apiPost, setAuthToken, getStoredToken } from '../api.js';
