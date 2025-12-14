'use client'

import { useEffect, useRef, useState } from 'react'

interface StaffOrderEvent {
  type: 'connected' | 'order_created' | 'order_updated'
  orderId?: string
  userId?: string
  status?: string
  timestamp?: number
  role?: string
}

/**
 * Hook for staff to subscribe to real-time updates for all orders
 * @param onOrderCreated - Callback when a new order is created
 * @param onOrderUpdated - Callback when an order is updated
 */
export function useStaffOrdersSSE(
  onOrderCreated?: (event: StaffOrderEvent) => void,
  onOrderUpdated?: (event: StaffOrderEvent) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Create EventSource connection
    const eventSource = new EventSource('/api/sse/staff/orders')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
      console.log('[Staff SSE] Connected to staff orders stream')
    }

    eventSource.onmessage = (event) => {
      try {
        const data: StaffOrderEvent = JSON.parse(event.data)
        console.log('[Staff SSE] Received:', data)

        if (data.type === 'order_created' && onOrderCreated) {
          onOrderCreated(data)
        } else if (data.type === 'order_updated' && onOrderUpdated) {
          onOrderUpdated(data)
        }
      } catch (err) {
        console.error('[Staff SSE] Error parsing message:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('[Staff SSE] Connection error:', err)
      setIsConnected(false)
      setError('Connection lost. Attempting to reconnect...')
    }

    // Cleanup on unmount
    return () => {
      console.log('[Staff SSE] Disconnecting from staff orders stream')
      eventSource.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
  }, [onOrderCreated, onOrderUpdated])

  return { isConnected, error }
}
