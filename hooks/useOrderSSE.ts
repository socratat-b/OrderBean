'use client'

import { useEffect, useRef, useState } from 'react'

interface OrderUpdateEvent {
  type: 'connected' | 'order_updated' | 'order_created'
  orderId?: string
  userId?: string
  status?: string
  timestamp?: number
}

/**
 * Hook for customers to subscribe to real-time updates for a specific order
 * @param orderId - The order ID to subscribe to
 * @param onUpdate - Callback function when order is updated
 */
export function useOrderSSE(
  orderId: string | null,
  onUpdate?: (event: OrderUpdateEvent) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!orderId) return

    // Create EventSource connection
    const eventSource = new EventSource(`/api/sse/orders/${orderId}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
      console.log(`[SSE] Connected to order ${orderId}`)
    }

    eventSource.onmessage = (event) => {
      try {
        const data: OrderUpdateEvent = JSON.parse(event.data)
        console.log('[SSE] Received:', data)

        if (onUpdate) {
          onUpdate(data)
        }
      } catch (err) {
        console.error('[SSE] Error parsing message:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('[SSE] Connection error:', err)
      setIsConnected(false)
      setError('Connection lost. Attempting to reconnect...')

      // EventSource automatically reconnects, so we don't need to manually handle it
    }

    // Cleanup on unmount
    return () => {
      console.log(`[SSE] Disconnecting from order ${orderId}`)
      eventSource.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
  }, [orderId, onUpdate])

  return { isConnected, error }
}
