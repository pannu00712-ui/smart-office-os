// @ts-nocheck
import React, { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { AppProvider } from './store/appContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EmployeesPage from './pages/EmployeesPage'
import AttendancePage from './pages/AttendancePage'
import CamerasPage from './pages/CamerasPage'
import AlertsPage from './pages/AlertsPage'
import ReportsPage from './pages/ReportsPage'
import PayrollPage from './pages/PayrollPage'
import DepartmentsPage from './pages/DepartmentsPage'
import ShiftsPage from './pages/ShiftsPage'
import LogsPage from './pages/LogsPage'
import EmployeePortalPage from './pages/EmployeePortalPage'
import EmployeeRecordsPage from './pages/EmployeeRecordsPage'
import SettingsPage from './pages/SettingsPage'
import Layout from './components/common/Layout'

function PrivateRoute({ children }) {
  const { token, user, fetchMe } = useAuthStore()
  useEffect(() => { if (token && !user) fetchMe() }, [token, user, fetchMe])
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"  element={<DashboardPage />} />
            <Route path="employees"  element={<EmployeesPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="cameras"    element={<CamerasPage />} />
            <Route path="alerts"     element={<AlertsPage />} />
            <Route path="reports"    element={<ReportsPage />} />
            <Route path="payroll"    element={<PayrollPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="shifts"     element={<ShiftsPage />} />
            <Route path="logs"       element={<LogsPage />} />
            <Route path="portal"     element={<EmployeePortalPage />} />
            <Route path="records"    element={<EmployeeRecordsPage />} />
            <Route path="settings"   element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}
