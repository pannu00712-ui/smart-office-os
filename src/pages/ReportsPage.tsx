import { useState } from 'react'
import { reportApi } from '../lib/api'
import { BarChart3, Download, Loader2 } from 'lucide-react'
import { format, subDays, startOfMonth } from 'date-fns'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'daily'|'monthly'>('daily')
  const [date, setDate]           = useState(format(new Date(), 'yyyy-MM-dd'))
  const [year, setYear]           = useState(new Date().getFullYear())
  const [month, setMonth]         = useState(new Date().getMonth() + 1)
  const [report, setReport]       = useState<any>(null)
  const [loading, setLoading]     = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      let r
      if (activeTab === 'daily') {
        r = await reportApi.daily({ target_date: date })
      } else {
        r = await reportApi.monthly({ year, month })
      }
      setReport(r.data)
    } catch { toast.error('Report generation failed') }
    finally { setLoading(false) }
  }

  const exportCsv = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const r = await reportApi.exportCsv({ date_from: date, date_to: today })
      const url = URL.createObjectURL(r.data)
      const a = document.createElement('a'); a.href = url
      a.download = `report_${date}.csv`; a.click()
      toast.success('Exported!')
    } catch { toast.error('Export failed') }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm">Generate attendance and break reports</p>
        </div>
        {report && (
          <button onClick={exportCsv} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex gap-2 mb-4">
          {(['daily', 'monthly'] as const).map(t => (
            <button key={t} onClick={() => { setActiveTab(t); setReport(null) }}
              className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                activeTab === t ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}>{t}</button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          {activeTab === 'daily' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input type="number" value={year} onChange={e => setYear(+e.target.value)} min={2020} max={2030}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select value={month} onChange={e => setMonth(+e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  {Array.from({length:12},(_,i)=>(
                    <option key={i+1} value={i+1}>
                      {format(new Date(2024, i, 1), 'MMMM')}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <button onClick={generate} disabled={loading}
            className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
            Generate Report
          </button>
        </div>
      </div>

      {/* Summary */}
      {report?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(report.summary).map(([k, v]) => (
            <div key={k} className="card text-center">
              <div className="text-2xl font-bold text-gray-900">{String(v)}{k.includes('rate') ? '%' : ''}</div>
              <div className="text-xs text-gray-500 capitalize mt-1">{k.replace(/_/g,' ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {report?.records && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">{report.records.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {report.records[0] && Object.keys(report.records[0]).map(k => (
                    <th key={k} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {k.replace(/_/g,' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {report.records.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.values(row).map((v: any, j) => (
                      <td key={j} className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {typeof v === 'boolean' ? (v ? '✓' : '—') : String(v ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
