// ─────────────────────────────────────────────────────────────
// useMatchSocket.js
// Custom hook that manages a STOMP / SockJS WebSocket connection
// for a live multiplayer match.
//
// Usage:
//   const { disconnect } = useMatchSocket(matchId, { onScore, onState })
//
// Connects when matchId becomes non-null, disconnects on unmount.
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useMatchSocket(matchId, { onScore, onState } = {}) {
  const clientRef = useRef(null)

  useEffect(() => {
    if (!matchId) return

    const token  = localStorage.getItem('geo_token')
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders:   { Authorization: `Bearer ${token}` },
      reconnectDelay:   3000,

      onConnect: () => {
        client.subscribe(`/topic/match/${matchId}/score`, msg => {
          try { onScore?.(JSON.parse(msg.body)) } catch {}
        })
        client.subscribe(`/topic/match/${matchId}/state`, msg => {
          try { onState?.(JSON.parse(msg.body)) } catch {}
        })
      },

      onStompError: frame => console.error('[WS] STOMP error', frame),
    })

    client.activate()
    clientRef.current = client

    return () => client.deactivate()
  }, [matchId])

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate()
  }, [])

  return { disconnect }
}
