import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

/**
 * useMatchSocket — subscribes to live match topics for a given matchId.
 *
 * @param {number|null} matchId
 * @param {{ onScore, onState }} handlers
 */
export function useMatchSocket(matchId, { onScore, onState } = {}) {
  const clientRef = useRef(null)

  useEffect(() => {
    if (!matchId) return

    const token = localStorage.getItem('geo_token')

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,

      onConnect: () => {
        client.subscribe(`/topic/match/${matchId}/score`, msg => {
          try { onScore?.(JSON.parse(msg.body)) } catch {}
        })
        client.subscribe(`/topic/match/${matchId}/state`, msg => {
          try { onState?.(JSON.parse(msg.body)) } catch {}
        })
      },

      onStompError: frame => {
        console.error('[WS] STOMP error', frame)
      },
    })

    client.activate()
    clientRef.current = client

    return () => { client.deactivate() }
  }, [matchId])

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate()
  }, [])

  return { disconnect }
}
