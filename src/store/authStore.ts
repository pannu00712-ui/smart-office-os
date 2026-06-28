import { create } from 'zustand'
import { authApi } from '../lib/api'

interface User {
  id: string
  email: string
  role: string
  org_id: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await authApi.login(email, password)
      const { access_token, user } = res.data
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('demo_email', email)
      set({ token: access_token, user, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('demo_email')
    set({ user: null, token: null })
    window.location.hash = '/login'
  },

  fetchMe: async () => {
    try {
      const res = await authApi.me()
      set({ user: res.data })
    } catch {
      localStorage.removeItem('access_token')
      set({ user: null, token: null })
    }
  },
}))
