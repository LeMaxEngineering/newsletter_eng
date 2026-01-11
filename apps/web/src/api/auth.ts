import type { SessionPayload } from '../types/auth.js';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export async function fetchSession(): Promise<SessionPayload> {
  const response = await fetch(`${API_BASE}/auth/session`);

  if (!response.ok) {
    throw new Error(`Failed to load session (${response.status})`);
  }

  return response.json();
}
