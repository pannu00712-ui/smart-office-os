// CamerasPage.tsx
import { useEffect, useState } from 'react'
import { cameraApi } from '../lib/api'
import { Camera, Plus, Wifi, WifiOff } from 'lucide-react'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

export default function CamerasPage() {
  const [cameras, setCameras] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ name: '', rtsp_url: '', camera_type: 'interior', location_desc: '', is_entry_cam: false, branch_id: '00000000-0000-0000-0000-000000000002' })

  const fetch = async () => {
    const r = await cameraApi.list()
    setCameras(r.data)
  }

  useEffect(() => { fetch() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await cameraApi.create(form)
      toast.success('Camera added')
      setShowAdd(false)
      fetch()
    } catch { toast.error('Failed to add camera') }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cameras</h1>
          <p className="text-gray-500 text-sm">{cameras.length} cameras configured</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Camera
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras.map(cam => (
          <div key={cam.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Camera size={20} className="text-gray-500" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{cam.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{cam.camera_type}</div>
                </div>
              </div>
              <div className={clsx('flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                cam.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              )}>
                {cam.status === 'active' ? <Wifi size={11} /> : <WifiOff size={11} />}
                {cam.status}
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>{cam.location_desc || 'No description'}</div>
              {cam.is_entry_cam && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Entry Cam</span>}
              {cam.is_exit_cam && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-1">Exit Cam</span>}
            </div>
          </div>
        ))}
        {cameras.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <Camera size={48} className="mx-auto mb-3 opacity-20" />
            <p>No cameras configured yet</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold mb-4">Add Camera</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Camera Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Main Entrance" required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RTSP URL</label>
                <input value={form.rtsp_url} onChange={e => setForm({...form, rtsp_url: e.target.value})}
                  placeholder="rtsp://192.168.1.100:554/stream1" required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.camera_type} onChange={e => setForm({...form, camera_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  {['entry','exit','interior','desk'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input value={form.location_desc} onChange={e => setForm({...form, location_desc: e.target.value})}
                  placeholder="Front door, lobby..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_entry_cam} onChange={e => setForm({...form, is_entry_cam: e.target.checked})} />
                Mark as Entry Camera (triggers check-in)
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Add Camera</button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
