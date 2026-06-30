// @ts-nocheck
import { createContext, useContext, useState, useEffect } from 'react'

// ─── Translations ─────────────────────────────────────────────────────────────
export const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard', employees: 'Employees', attendance: 'Attendance', cameras: 'Cameras',
    payroll: 'Payroll', reports: 'Reports', departments: 'Departments', shifts: 'Shifts',
    myPortal: 'My Portal', employeeRecords: 'Employee Records', alerts: 'Alerts', auditLogs: 'Audit Logs',
    settings: 'Settings', signOut: 'Sign Out', autoSaved: 'Auto-saved', autoSaveOn: 'Auto-save on',
    notifications: 'Notifications', markAllRead: 'Mark all read', noNotifications: 'No notifications',
    language: 'Language', theme: 'Theme', dark: 'Dark', light: 'Light',
    permissions: 'Permissions', backup: 'Backup & Restore', backupNow: 'Backup Now', restoreData: 'Restore Data',
    welcome: 'Welcome', searchPlaceholder: 'Search...',
  },
  ur: {
    dashboard: 'ڈیش بورڈ', employees: 'ملازمین', attendance: 'حاضری', cameras: 'کیمرے',
    payroll: 'تنخواہ', reports: 'رپورٹس', departments: 'شعبے', shifts: 'شفٹیں',
    myPortal: 'میرا پورٹل', employeeRecords: 'ملازم کا ریکارڈ', alerts: 'الرٹس', auditLogs: 'آڈٹ لاگز',
    settings: 'ترتیبات', signOut: 'سائن آؤٹ', autoSaved: 'خودکار محفوظ', autoSaveOn: 'خودکار محفوظ آن',
    notifications: 'اطلاعات', markAllRead: 'سب پڑھے گئے کے طور پر نشان زد کریں', noNotifications: 'کوئی اطلاع نہیں',
    language: 'زبان', theme: 'تھیم', dark: 'ڈارک', light: 'لائٹ',
    permissions: 'اجازتیں', backup: 'بیک اپ اور بحالی', backupNow: 'ابھی بیک اپ کریں', restoreData: 'ڈیٹا بحال کریں',
    welcome: 'خوش آمدید', searchPlaceholder: 'تلاش کریں...',
  },
}

// ─── Role Permissions ──────────────────────────────────────────────────────────
export const ROLE_PERMISSIONS = {
  super_admin: { label: 'Super Admin', canEdit: true, canDelete: true, canApprove: true, canViewPayroll: true, canViewLogs: true, needsApproval: false, color: '#2dd4bf' },
  hr_manager:  { label: 'HR Manager', canEdit: true, canDelete: false, canApprove: true, canViewPayroll: true, canViewLogs: true, needsApproval: false, color: '#818cf8' },
  manager:     { label: 'Manager', canEdit: true, canDelete: false, canApprove: false, canViewPayroll: false, canViewLogs: false, needsApproval: true, color: '#fbbf24' },
  employee:    { label: 'Employee', canEdit: false, canDelete: false, canApprove: false, canViewPayroll: false, canViewLogs: false, needsApproval: true, color: '#94a3b8' },
}

// ─── Notification seed data ─────────────────────────────────────────────────────
const INIT_NOTIFICATIONS = [
  { id: 1, title: 'Leave request pending', body: 'Ayesha Khan requested casual leave', time: '5 min ago', read: false, type: 'leave' },
  { id: 2, title: 'Camera offline', body: 'CAM-002 Parking went offline', time: '15 min ago', read: false, type: 'alert' },
  { id: 3, title: 'Payroll run completed', body: 'June 2025 payroll processed for 5 employees', time: '1 hour ago', read: false, type: 'payroll' },
  { id: 4, title: 'New document uploaded', body: 'Hassan Malik uploaded employment contract', time: '2 hours ago', read: true, type: 'document' },
  { id: 5, title: 'Birthday reminder', body: "Zara Ahmed's birthday is in 3 days", time: '3 hours ago', read: true, type: 'event' },
]

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage_get('soos_theme', 'dark'))
  const [lang, setLang] = useState(() => localStorage_get('soos_lang', 'en'))
  const [notifications, setNotifications] = useState(INIT_NOTIFICATIONS)
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 1, type: 'Salary Update', requestedBy: 'manager@soos.io', target: 'EMP-003 Ayesha Khan', detail: 'Increase basic salary from 85,000 to 90,000', status: 'pending' },
    { id: 2, type: 'Department Change', requestedBy: 'manager@soos.io', target: 'EMP-006 Bilal Siddiqui', detail: 'Move from Operations to Engineering', status: 'pending' },
  ])

  function localStorage_get(key, fallback) {
    try { return localStorage.getItem(key) || fallback } catch { return fallback }
  }

  useEffect(() => {
    try { localStorage.setItem('soos_theme', theme) } catch {}
  }, [theme])
  useEffect(() => {
    try { localStorage.setItem('soos_lang', lang) } catch {}
  }, [lang])

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key
  const isRTL = lang === 'ur'

  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })))
  const unreadCount = notifications.filter(n => !n.read).length

  const colors = theme === 'dark'
    ? { bg: '#0a1628', panel: '#131c2e', panelDark: '#0d1526', border: '#1e2d45', text: '#f1f5f9', textMuted: '#64748b', textFaint: '#475569' }
    : { bg: '#f1f5f9', panel: '#ffffff', panelDark: '#f8fafc', border: '#e2e8f0', text: '#0f172a', textMuted: '#475569', textFaint: '#94a3b8' }

  return (
    <AppContext.Provider value={{
      theme, setTheme, lang, setLang, t, isRTL, colors,
      notifications, setNotifications, markAllRead, unreadCount,
      pendingApprovals, setPendingApprovals,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
