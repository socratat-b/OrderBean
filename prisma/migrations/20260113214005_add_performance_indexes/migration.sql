-- CreateIndex
-- Add indexes for improved query performance on Order table
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");

-- Add composite index for date range queries with status
CREATE INDEX IF NOT EXISTS "Order_createdAt_status_idx" ON "Order"("createdAt", "status");
