'use client'

import { useEffect, useRef, useState } from 'react'

interface OwnerOrderEvent {
  type: 'connected' | 'order_created' | 'order_updated'
  orderId?: string
  userId?: string
  status?: string
  timestamp?: number
  role?: string
}

/**
 * Hook for owners to subscribe to real-time updates for all orders and analytics
 * @param onOrderCreated - Callback when a new order is created
 * @param onOrderUpdated - Callback when an order is updated
 */
export function useOwnerOrdersSSE(
  onOrderCreated?: (event: OwnerOrderEvent) => void,
  onOrderUpdated?: (event: OwnerOrderEvent) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Use refs for callbacks to avoid re-creating EventSource on every render
  const onOrderCreatedRef = useRef(onOrderCreated)
  const onOrderUpdatedRef = useRef(onOrderUpdated)

  // Keep refs up to date
  useEffect(() => {
    onOrderCreatedRef.current = onOrderCreated
    onOrderUpdatedRef.current = onOrderUpdated
  })

  useEffect(() => {
    // Create EventSource connection
    const eventSource = new EventSource('/api/sse/owner/orders')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
      console.log('[Owner SSE] Connected to owner orders stream')
    }

    eventSource.onmessage = (event) => {
      try {
        const data: OwnerOrderEvent = JSON.parse(event.data)
        console.log('[Owner SSE] Received:', data)

        if (data.type === 'order_created' && onOrderCreatedRef.current) {
          onOrderCreatedRef.current(data)
        } else if (data.type === 'order_updated' && onOrderUpdatedRef.current) {
          onOrderUpdatedRef.current(data)
        }
      } catch (err) {
        console.error('[Owner SSE] Error parsing message:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('[Owner SSE] Connection error:', err)
      setIsConnected(false)
      setError('Connection lost. Attempting to reconnect...')
    }

    // Cleanup on unmount
    return () => {
      console.log('[Owner SSE] Disconnecting from owner orders stream')
      eventSource.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
  }, []) // Empty dependency array - only run once on mount

  return { isConnected, error }
}
