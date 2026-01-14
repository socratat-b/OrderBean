/**
 * Event Emitter for broadcasting order updates via SSE
 *
 * Now uses Redis pub/sub for cross-instance communication on Vercel.
 * Falls back to in-memory for development/single-server deployments.
 */

import { publishOrderEvent, REDIS_CHANNELS } from './redis'

type EventCallback = (data: any) => void

class EventEmitter {
  private events: Map<string, Set<EventCallback>> = new Map()

  /**
   * Subscribe to an event (in-memory only, for local development)
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
   * Now publishes to Redis for cross-instance communication
   */
  async emit(event: string, data: any) {
    // Emit to in-memory listeners (for local development)
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

    // Publish to Redis for cross-instance communication (Vercel)
    // Map event names to Redis channels
    const channelMap: Record<string, string> = {
      [ORDER_EVENTS.ORDER_CREATED]: REDIS_CHANNELS.ORDER_CREATED,
      [ORDER_EVENTS.ORDER_UPDATED]: REDIS_CHANNELS.ORDER_UPDATED,
      [ORDER_EVENTS.ORDER_STATUS_CHANGED]: REDIS_CHANNELS.ORDER_STATUS_CHANGED,
      [ORDER_EVENTS.LOW_STOCK_ALERT]: REDIS_CHANNELS.LOW_STOCK_ALERT,
      [ORDER_EVENTS.STOCK_UPDATED]: REDIS_CHANNELS.STOCK_UPDATED,
      [ORDER_EVENTS.OUT_OF_STOCK]: REDIS_CHANNELS.OUT_OF_STOCK,
    }

    const redisChannel = channelMap[event]
    if (redisChannel) {
      await publishOrderEvent(redisChannel, data)
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
  // Inventory events
  LOW_STOCK_ALERT: 'inventory:low_stock_alert',
  STOCK_UPDATED: 'inventory:stock_updated',
  OUT_OF_STOCK: 'inventory:out_of_stock',
} as const

export type OrderEvent = {
  orderId: string
  userId: string
  status: string
  timestamp: number
}

export type InventoryEvent = {
  productId: string
  productName: string
  stockQuantity: number
  lowStockThreshold?: number
  timestamp: number
}
