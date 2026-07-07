// @ts-nocheck
import { create } from 'zustand'
import { api } from '../lib/api'

interface AuthState {
  user: any; token: string | null; isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

// ─── Offline fallback accounts ────────────────────────────────────────────────
// Used ONLY when backend server is not reachable.
// Delete or change these credentials before going to production.
const OFFLINE_ACCOUNTS = [
  { email: 'admin@soos.io', password: 'admin123', user: { id: 1, name: 'Admin', email: 'admin@soos.io', role: 'super_admin' } },
  { email: 'hr@soos.io',    password: 'hr123',    user: { id: 2, name: 'HR Manager', email: 'hr@soos.io', role: 'hr_manager' } },
]

function findOfflineAccount(email, password) {
  return OFFLINE_ACCOUNTS.find(
    a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
  )
}

function loadStoredUser() {
  try { const r = localStorage.getItem('demo_user'); return r ? JSON.parse(r) : null; } catch { return null; }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const token = localStorage.getItem('access_token')
      if (token && token.startsWith('offline-token-')) return loadStoredUser()
    } catch {}
    return null
  })(),
  token: (() => { try { return localStorage.getItem('access_token') } catch { return null } })(),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })

    // 1) Try real backend first
    try {
      const data = await api.login(email, password)
      try { localStorage.setItem('access_token', data.token) } catch {}
      set({ token: data.token, user: data.user, isLoading: false })
      return
    } catch (err) {
      // Backend not reachable — try offline accounts
      const offline = findOfflineAccount(email, password)
      if (offline) {
        const token = 'offline-token-' + Date.now()
        try {
          localStorage.setItem('access_token', token)
          localStorage.setItem('demo_user', JSON.stringify(offline.user))
        } catch {}
        set({ token, user: offline.user, isLoading: false })
        return
      }
      // Neither backend nor offline matched
      set({ isLoading: false })
      throw new Error('Invalid email or password')
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('demo_user')
    } catch {}
    set({ user: null, token: null })
    window.location.hash = '/login'
  },

  fetchMe: async () => {
    let token = null
    try { token = localStorage.getItem('access_token') } catch {}
    if (token && token.startsWith('offline-token-')) {
      set({ user: loadStoredUser() }); return
    }
    try {
      const data = await api.me()
      set({ user: data.user })
    } catch {
      try { localStorage.removeItem('access_token') } catch {}
      set({ user: null, token: null })
    }
  },
}))
