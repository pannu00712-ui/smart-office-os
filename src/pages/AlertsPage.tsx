// AlertsPage.tsx
import { useEffect, useState } from 'react'
import { alertApi } from '../lib/api'
import { Bell, CheckCheck, AlertTriangle, Info, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

export default function AlertsPage() {
  const [alerts, setAlerts]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<string>('')

  const fetch = async () => {
    setLoading(true)
    try {
      const r = await alertApi.list({ severity: filter || undefined, limit: 100 })
      setAlerts(r.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [filter])

  const ack = async (id: string) => {
    await alertApi.acknowledge(id)
    toast.success('Alert acknowledged')
    fetch()
  }

  const markAll = async () => {
    await alertApi.markAllRead()
    toast.success('All marked as read')
    fetch()
  }

  const severityIcon = (s: string) => {
    if (s === 'critical' || s === 'high') return <XCircle size={16} className="text-red-500" />
    if (s === 'medium') return <AlertTriangle size={16} className="text-orange-500" />
    return <Info size={16} className="text-blue-400" />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-500 text-sm">{alerts.filter(a => !a.is_read).length} unread</p>
        </div>
        <button onClick={markAll} className="btn-secondary flex items-center gap-2">
          <CheckCheck size={16} /> Mark All Read
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['', 'critical', 'high', 'medium', 'low'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filter === s ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Bell size={48} className="mx-auto mb-3 opacity-20" />
            <p>No alerts found</p>
          </div>
        ) : alerts.map(a => (
          <div key={a.id} className={clsx('card flex items-start gap-4 p-4',
            !a.is_read && 'border-l-4 border-l-accent'
          )}>
            {severityIcon(a.severity)}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-medium text-gray-800 text-sm">{a.title}</span>
                  <span className={clsx('ml-2 px-1.5 py-0.5 rounded text-xs',
                    a.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    a.severity === 'high'     ? 'bg-red-50 text-red-600' :
                    a.severity === 'medium'   ? 'bg-orange-100 text-orange-700' :
                                               'bg-yellow-100 text-yellow-700'
                  )}>{a.severity}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {format(new Date(a.created_at), 'dd MMM, HH:mm')}
                </span>
              </div>
              {a.message && <p className="text-xs text-gray-500 mt-1">{a.message}</p>}
            </div>
            {!a.is_read && (
              <button onClick={() => ack(a.id)} className="text-xs text-accent hover:text-accent-dark font-medium flex-shrink-0">
                Acknowledge
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
