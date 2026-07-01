// AttendancePage.tsx
import { useEffect, useState } from 'react'
import { attendanceApi, api } from '../lib/api'
import { format, subDays } from 'date-fns'
import { Download, LogIn, LogOut } from 'lucide-react'
import { clsx } from 'clsx'
import { reportApi } from '../lib/api'
import toast from 'react-hot-toast'

export default function AttendancePage() {
  const [records, setRecords]   = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'))
  const [dateTo, setDateTo]     = useState(format(new Date(), 'yyyy-MM-dd'))
  const [statusFilter, setStatus] = useState('')
  const [loading, setLoading]   = useState(true)
  const [selectedEmp, setSelectedEmp] = useState('')
  const [marking, setMarking] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const r = await attendanceApi.list({ date_from: dateFrom, date_to: dateTo, status: statusFilter || undefined })
      setRecords(r.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [dateFrom, dateTo, statusFilter])

  useEffect(() => {
    api.getEmployees()
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data || []
        setEmployees(list)
        if (list.length && !selectedEmp) setSelectedEmp(String(list[0].id))
      })
      .catch(() => {})
  }, [])

  const employeeLabel = (id) => {
    const e = employees.find(e => String(e.id) === String(id))
    return e ? `${e.firstName} ${e.lastName}` : id
  }

  const manualCheckIn = async () => {
    if (!selectedEmp) return
    setMarking(true)
    try {
      await attendanceApi.checkin({ employee_id: selectedEmp, employee_name: employeeLabel(selectedEmp), is_manual_override: true })
      toast.success('Checked in')
      fetch()
    } catch (e) { toast.error(e.message || 'Check-in failed') }
    finally { setMarking(false) }
  }

  const manualCheckOut = async () => {
    if (!selectedEmp) return
    setMarking(true)
    try {
      await attendanceApi.checkout({ employee_id: selectedEmp })
      toast.success('Checked out')
      fetch()
    } catch (e) { toast.error(e.message || 'No open check-in found for this employee') }
    finally { setMarking(false) }
  }

  const exportCsv = async () => {
    try {
      const r = await reportApi.exportCsv({ date_from: dateFrom, date_to: dateTo })
      const url = URL.createObjectURL(r.data)
      const a = document.createElement('a'); a.href = url
      a.download = `attendance_${dateFrom}_${dateTo}.csv`; a.click()
      toast.success('CSV exported')
    } catch { toast.error('Export failed') }
  }

  const badge = (s: string) => (
    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium',
      s==='present'  && 'bg-green-100 text-green-700',
      s==='late'     && 'bg-orange-100 text-orange-700',
      s==='absent'   && 'bg-red-100 text-red-700',
      s==='half_day' && 'bg-yellow-100 text-yellow-700',
      s==='on_leave' && 'bg-purple-100 text-purple-700',
    )}>{s.replace('_', ' ')}</span>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm">{records.length} records</p>
        </div>
        <button onClick={exportCsv} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Manual check-in/out — for when a camera isn't set up or someone forgot */}
      <div className="card flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Employee</label>
          <select value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
            {employees.length === 0 && <option value="">No employees yet — add one first</option>}
            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} {e.code ? `(${e.code})` : ''}</option>)}
          </select>
        </div>
        <button onClick={manualCheckIn} disabled={marking || !selectedEmp} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          <LogIn size={16} /> Check In
        </button>
        <button onClick={manualCheckOut} disabled={marking || !selectedEmp} className="btn-secondary flex items-center gap-2 disabled:opacity-50">
          <LogOut size={16} /> Check Out
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select value={statusFilter} onChange={e => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
            <option value="">All</option>
            {['present','late','absent','half_day','on_leave'].map(s =>
              <option key={s} value={s}>{s.replace('_',' ')}</option>
            )}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Employee','Date','Status','Check In','Check Out','Hours','Late (min)','Override'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">No records found</td></tr>
            ) : records.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.employee_name || employeeLabel(r.employee_id)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.date}</td>
                <td className="px-4 py-3">{badge(r.status)}</td>
                <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                  {r.check_in_time ? format(new Date(r.check_in_time), 'HH:mm') : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                  {r.check_out_time ? format(new Date(r.check_out_time), 'HH:mm') : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.total_hours ? `${r.total_hours}h` : '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.late_minutes || 0}</td>
                <td className="px-4 py-3">
                  {r.is_manual_override && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Override</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
