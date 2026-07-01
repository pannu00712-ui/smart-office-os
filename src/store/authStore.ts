// @ts-nocheck
import { create } from 'zustand'
import { api } from '../lib/api'

interface AuthState {
  user: any; token: string | null; isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: (() => { try { return localStorage.getItem('access_token'); } catch { return null; } })(),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
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
    try { localStorage.removeItem('access_token'); } catch {}
    set({ user: null, token: null });
    window.location.hash = '/login';
  },

  fetchMe: async () => {
    try {
      const data = await api.me();
      set({ user: data.user });
    } catch {
      try { localStorage.removeItem('access_token'); } catch {}
      set({ user: null, token: null });
    }
  },
}));
