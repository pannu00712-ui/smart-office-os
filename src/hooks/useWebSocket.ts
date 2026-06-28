import { useEffect, useRef, useCallback } from 'react'

type Handler = (data: any) => void

export function useWebSocket(handlers: Record<string, Handler>) {
  const ws = useRef<WebSocket | null>(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const connect = useCallback(() => {
    const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:8000') + '/ws/live'
    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => console.log('[WS] Connected')

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        const handler = handlersRef.current[data.type] || handlersRef.current['*']
        if (handler) handler(data)
      } catch {}
    }

    ws.current.onclose = () => {
      console.log('[WS] Disconnected — reconnecting in 3s')
      setTimeout(connect, 3000)
    }

    ws.current.onerror = () => ws.current?.close()
  }, [])

  useEffect(() => {
    connect()
    return () => {
      ws.current?.close()
    }
  }, [connect])
}
