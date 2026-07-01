// @ts-nocheck
import { create } from 'zustand'
import { api } from '../lib/api'

interface AuthState {
  user: any; token: string | null; isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

// ─── Demo/offline login ────────────────────────────────────────────────────
// This app ships as a standalone demo — there is no backend server running
// on localhost:4000 by default. If the entered credentials match one of the
// known demo accounts below, we log the user in locally without ever
// touching the network. Real backend login is still attempted as a fallback
// for anyone who *does* wire up a server later (see src/lib/api.ts).
const DEMO_ACCOUNTS = [
  { email: 'admin@demo.com', password: 'Admin@1234', user: { id: 1, name: 'Admin', email: 'admin@demo.com', role: 'admin' } },
  { email: 'admin@soos.io',  password: 'admin123',   user: { id: 2, name: 'Admin', email: 'admin@soos.io',  role: 'admin' } },
];

function findDemoAccount(email: string, password: string) {
  return DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
  );
}

function loadStoredDemoUser() {
  try {
    const raw = localStorage.getItem('demo_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const token = localStorage.getItem('access_token');
      if (token && token.startsWith('demo-token-')) return loadStoredDemoUser();
    } catch {}
    return null;
  })(),
  token: (() => { try { return localStorage.getItem('access_token'); } catch { return null; } })(),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });

    // 1) Try demo credentials first — works fully offline, no backend needed.
    const demo = findDemoAccount(email, password);
    if (demo) {
      const fakeToken = 'demo-token-' + Date.now();
      try {
        localStorage.setItem('access_token', fakeToken);
        localStorage.setItem('demo_user', JSON.stringify(demo.user));
      } catch {}
      set({ token: fakeToken, user: demo.user, isLoading: false });
      return;
    }

    // 2) Fall back to a real backend call, in case one has been configured.
    try {
      const data = await api.login(email, password);
      try { localStorage.setItem('access_token', data.token); } catch {}
      set({ token: data.token, user: data.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('demo_user');
    } catch {}
    set({ user: null, token: null });
    window.location.hash = '/login';
  },

  fetchMe: async () => {
    // Demo sessions carry a token we generated locally — don't hit the
    // (likely nonexistent) backend for these, just restore the saved user.
    let token: string | null = null;
    try { token = localStorage.getItem('access_token'); } catch {}
    if (token && token.startsWith('demo-token-')) {
      set({ user: loadStoredDemoUser() });
      return;
    }

    try {
      const data = await api.me();
      set({ user: data.user });
    } catch {
      try { localStorage.removeItem('access_token'); } catch {}
      set({ user: null, token: null });
    }
  },
}));
