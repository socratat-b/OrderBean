/**
 * Simple Event Emitter for broadcasting order updates via SSE
 *
 * Note: This is an in-memory implementation suitable for development
 * and single-server deployments. For serverless/multi-instance production
 * (e.g., Vercel), consider using Redis pub/sub or a polling approach.
 */

type EventCallback = (data: any) => void

class EventEmitter {
  private events: Map<string, Set<EventCallback>> = new Map()

  /**
   * Subscribe to an event
   */
  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(callback)
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.delete(callback)
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit(event: string, data: any) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error)
        }
      })
    }
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.size ?? 0
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string) {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }
}

// Singleton instance
export const orderEvents = new EventEmitter()

// Event names
export const ORDER_EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
} as const

export type OrderEvent = {
  orderId: string
  userId: string
  status: string
  timestamp: number
}
