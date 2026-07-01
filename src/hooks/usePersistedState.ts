// @ts-nocheck
import { useState, useEffect, useRef } from 'react'

/**
 * Drop-in replacement for useState that automatically saves to (and loads
 * from) localStorage under the given key. This is what makes data added in
 * the app (employees, cameras, departments, shifts, payroll items, etc.)
 * survive an app restart / page refresh instead of resetting to the
 * hardcoded demo data every time.
 *
 * Usage:
 *   const [employees, setEmployees] = usePersistedState('soos_employees', MOCK_EMPLOYEES)
 *
 * On first run (nothing saved yet) it uses `initialValue` (your mock data)
 * as the starting point, then every future change is written to
 * localStorage automatically. Delete the browser's localStorage / app data
 * to reset back to demo data.
 */
export function usePersistedState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw != null) return JSON.parse(raw)
    } catch {}
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  const isFirstRun = useRef(true)

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (e) {
      // localStorage can fail if quota is exceeded or data isn't serializable
      console.error(`Failed to persist "${key}" to localStorage:`, e)
    }
  }, [key, state])

  return [state, setState]
}
