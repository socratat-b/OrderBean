# E2E Tests for OrderBean

This directory contains end-to-end tests using Playwright to verify the application functionality, especially real-time updates.

## Test Files

1. **auth.spec.ts** - Authentication flow tests
2. **staff-realtime-updates.spec.ts** - Staff dashboard real-time update tests
3. **debug-sse-redis.spec.ts** - Debug tests for SSE + Redis connection

## Prerequisites

1. Install Playwright browsers (first time only):
```bash
pnpm exec playwright install
```

2. Make sure your dev server is running:
```bash
pnpm run dev
```

3. Ensure Redis credentials are in `.env`:
```bash
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

## Running Tests

### Run all E2E tests:
```bash
pnpm run test:e2e
```

### Run specific test file:
```bash
pnpm exec playwright test e2e/staff-realtime-updates.spec.ts
```

### Run tests in UI mode (interactive):
```bash
pnpm run test:e2e:ui
```

### Run tests in debug mode (step through):
```bash
pnpm run test:e2e:debug
```

### Run debug tests only:
```bash
pnpm exec playwright test e2e/debug-sse-redis.spec.ts
```

### View test report:
```bash
pnpm run test:e2e:report
```

## Test Accounts

The tests use these pre-seeded accounts:

- **Customer**: bedisscottandrew3@gmail.com / Tatadmin26@
- **Staff**: staff@coffee.com / staff123

Make sure these accounts exist in your database.

## Debugging Failed Tests

If tests fail, check:

1. **Screenshots**: `test-results/` folder will have screenshots
2. **Traces**: Can be viewed with `pnpm exec playwright show-trace <trace-file>`
3. **Console logs**: Tests output detailed logs to help diagnose issues

### Common Issues

**Issue: SSE not connecting**
- Check if Redis credentials are correct in `.env`
- Verify dev server is running
- Run debug tests: `pnpm exec playwright test e2e/debug-sse-redis.spec.ts`

**Issue: Order count not updating**
- Check browser console logs during test
- Verify Redis Streams are receiving events (check server logs)
- Make sure polling interval allows enough time (tests wait 7 seconds)

**Issue: Payment flow fails**
- PayMongo test mode can be unpredictable
- Test falls back to manually navigating to success page
- Check if cart data is in localStorage

## Test Structure

### staff-realtime-updates.spec.ts

This test simulates the real-world scenario:

1. Opens two browser contexts (customer & staff)
2. Staff logs in and opens dashboard
3. Captures initial order counts
4. Customer logs in and places an order
5. Waits for SSE to deliver update to staff
6. Verifies staff dashboard updated:
   - Total order count increased
   - "ALL" filter count increased
   - New order visible in list

### debug-sse-redis.spec.ts

These tests help diagnose issues:

1. **SSE Connection Test**: Verifies SSE endpoint is called
2. **Keepalive Test**: Listens for SSE keepalive messages
3. **Redis Config Test**: Checks for Redis-related errors
4. **Order Count Test**: Validates initial data consistency

## Running Tests in CI

Tests are configured to run in CI with:
- 2 retries on failure
- Sequential execution (no parallelism)
- Screenshots on failure
- Traces on first retry

## Tips

- **Headed mode**: See what's happening:
  ```bash
  pnpm exec playwright test --headed
  ```

- **Specific browser**:
  ```bash
  pnpm exec playwright test --project=chromium
  ```

- **Update snapshots**:
  ```bash
  pnpm exec playwright test --update-snapshots
  ```

- **Generate tests**: Use codegen to create new tests:
  ```bash
  pnpm exec playwright codegen http://localhost:3000
  ```
