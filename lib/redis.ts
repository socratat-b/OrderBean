/**
 * Upstash Redis client for real-time pub/sub across serverless instances
 *
 * This replaces the in-memory event emitter to work correctly on Vercel
 * where each API route runs in a separate serverless instance.
 */

import { Redis } from '@upstash/redis'

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Redis channel names (prefix with app name to avoid conflicts)
export const REDIS_CHANNELS = {
  ORDER_CREATED: 'orderbean:order:created',
  ORDER_UPDATED: 'orderbean:order:updated',
  ORDER_STATUS_CHANGED: 'orderbean:order:status_changed',
} as const

export type OrderEvent = {
  orderId: string
  userId: string
  status: string
  timestamp: number
}

/**
 * Publish an order event to Redis Stream
 * This will be received by all SSE connections polling the stream
 */
export async function publishOrderEvent(streamName: string, event: OrderEvent) {
  try {
    // Add message to Redis Stream (Upstash Redis format)
    await redis.xadd(
      streamName,
      '*', // Auto-generate ID
      {
        orderId: event.orderId,
        userId: event.userId,
        status: event.status,
        timestamp: event.timestamp.toString(),
      }
    )

    console.log(`[Redis Stream] Added to ${streamName}:`, event)

    // Trim stream to keep only last 100 messages (prevents memory growth)
    await redis.xtrim(streamName, { strategy: 'MAXLEN', threshold: 100, exactness: '~' })
  } catch (error) {
    console.error(`[Redis Stream] Failed to add to ${streamName}:`, error)
  }
}
