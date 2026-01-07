# Testing Guide for OrderBean

This project uses a comprehensive testing stack for Next.js 16 + React 19:

- **Playwright** - End-to-End (E2E) Testing
- **Vitest** - Integration & Unit Testing
- **React Testing Library** - Component Testing

## Table of Contents

- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Database Setup](#test-database-setup)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

1. Install dependencies (already done during setup):
   ```bash
   pnpm install
   ```

2. Set up test database (see [Test Database Setup](#test-database-setup))

3. Run tests:
   ```bash
   # Run all unit/integration tests
   pnpm test

   # Run E2E tests
   pnpm test:e2e
   ```

## Test Structure

```
order-bean/
├── e2e/                          # Playwright E2E tests
│   └── auth.spec.ts              # Authentication flow tests
├── __tests__/
│   ├── integration/              # Integration tests (Server Actions, API routes)
│   │   └── auth.test.ts          # Auth Server Actions tests
│   └── components/               # Component tests (React Testing Library)
│       └── DemoModeBanner.test.tsx
├── playwright.config.ts          # Playwright configuration
├── vitest.config.ts              # Vitest configuration
├── vitest.setup.ts               # Vitest setup (mocks, globals)
└── .env.test                     # Test environment variables
```

## Running Tests

### Unit & Integration Tests (Vitest)

```bash
# Run tests once
pnpm test

# Watch mode (re-run on file changes)
pnpm test:watch

# UI mode (interactive test runner)
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

**Coverage Reports:** After running `pnpm test:coverage`, open `coverage/index.html` in your browser.

### E2E Tests (Playwright)

```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run with UI mode (see tests running in browser)
pnpm test:e2e:ui

# Debug mode (step through tests)
pnpm test:e2e:debug

# View last test report
pnpm test:e2e:report
```

**Note:** E2E tests will automatically start the dev server on `http://localhost:3000` before running.

### Run Specific Tests

```bash
# Vitest - Run specific test file
pnpm test auth.test.ts

# Vitest - Run tests matching pattern
pnpm test --grep "should login"

# Playwright - Run specific test file
pnpm test:e2e e2e/auth.spec.ts

# Playwright - Run tests matching pattern
pnpm test:e2e --grep "should register"
```

## Writing Tests

### E2E Tests (Playwright)

**Location:** `e2e/*.spec.ts`

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
  });
});
```

**Best Practices:**
- Test complete user flows (registration → login → checkout → order)
- Use `page.goto()`, `page.fill()`, `page.click()` for interactions
- Use `expect(page).toHaveURL()` for navigation checks
- Use `expect(locator).toBeVisible()` for element visibility
- Generate unique emails with timestamps to avoid conflicts
- Clean up test data after tests (if needed)

### Integration Tests (Vitest)

**Location:** `__tests__/integration/*.test.ts`

**Example:**
```typescript
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { signup } from '@/actions/auth';
import { prisma } from '@/lib/prisma';

describe('Auth Server Actions', () => {
  afterAll(async () => {
    // Cleanup test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'test' } }
    });
  });

  it('should create user', async () => {
    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'test@example.com');
    formData.append('password', 'Password123!');

    const result = await signup(null, formData);
    expect(result?.errors).toBeUndefined();
  });
});
```

**Best Practices:**
- Test Server Actions and API route handlers
- Use real database (test database) for integration tests
- Clean up test data in `afterAll` or `afterEach` hooks
- Use unique identifiers to avoid test conflicts
- Test validation, error handling, and business logic

### Component Tests (React Testing Library)

**Location:** `__tests__/components/*.test.tsx`

**Example:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle click', () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

**Best Practices:**
- Test user-facing behavior, not implementation details
- Use `screen.getByRole()`, `screen.getByLabelText()` over `getByTestId()`
- Test accessibility (proper ARIA labels, keyboard navigation)
- Mock external dependencies (API calls, Next.js router)
- Use `vi.fn()` for mocking functions
- Use `fireEvent` or `userEvent` for interactions

## Test Database Setup

### Option 1: Use Development Database (Quick & Easy)

Use your existing development database for tests. **Warning:** Tests will create and delete data.

1. Your tests will use the `DATABASE_URL` from `.env`
2. No additional setup needed

### Option 2: Separate Test Database (Recommended)

Create a dedicated test database to avoid affecting development data.

1. **Create test database:**
   ```bash
   # Using psql
   createdb orderbean_test

   # Or via SQL
   psql -U your_user -c "CREATE DATABASE orderbean_test;"
   ```

2. **Configure test environment:**
   ```bash
   cp .env.test .env.test.local
   ```

   Edit `.env.test.local` and update:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/orderbean_test"
   DIRECT_URL="postgresql://user:password@localhost:5432/orderbean_test"
   ```

3. **Run migrations on test database:**
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/orderbean_test" npx prisma migrate deploy
   ```

4. **Seed test data (optional):**
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/orderbean_test" pnpm run seed:staff
   DATABASE_URL="postgresql://user:password@localhost:5432/orderbean_test" pnpm run seed:owner
   ```

5. **Load test environment in tests:**

   For Vitest, update `vitest.config.ts`:
   ```typescript
   import { loadEnv } from 'vite';

   export default defineConfig({
     // ... other config
     test: {
       env: loadEnv('test', process.cwd(), ''),
     },
   });
   ```

### Option 3: In-Memory SQLite (Fast, Isolated)

For ultra-fast tests without PostgreSQL dependency:

1. Install SQLite driver:
   ```bash
   pnpm install -D better-sqlite3
   ```

2. Update `vitest.setup.ts` to use SQLite in test environment
3. Note: Some PostgreSQL-specific features may not work

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: orderbean_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run Prisma migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/orderbean_test

      - name: Run unit tests
        run: pnpm test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/orderbean_test

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/orderbean_test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: |
            playwright-report/
            coverage/
```

## Troubleshooting

### Vitest Issues

**Problem:** `Cannot find module '@/...'`
- **Solution:** Check `vitest.config.ts` has `vite-tsconfig-paths` plugin

**Problem:** Tests fail with database connection errors
- **Solution:** Ensure test database exists and `DATABASE_URL` is correct

**Problem:** `ReferenceError: vi is not defined`
- **Solution:** Add `globals: true` in `vitest.config.ts`

### Playwright Issues

**Problem:** `Error: page.goto: net::ERR_CONNECTION_REFUSED`
- **Solution:** Ensure dev server is running. Check `webServer` config in `playwright.config.ts`

**Problem:** Tests are flaky (sometimes pass, sometimes fail)
- **Solution:**
  - Add explicit waits: `await page.waitForURL()`
  - Increase timeouts: `{ timeout: 10000 }`
  - Use `expect(locator).toBeVisible()` instead of checking immediately

**Problem:** `browserType.launch: Executable doesn't exist`
- **Solution:** Run `npx playwright install chromium`

### Database Issues

**Problem:** Tests create duplicate data
- **Solution:** Use unique identifiers (timestamps, UUIDs) in test data

**Problem:** Tests fail due to existing data
- **Solution:** Clean up data in `beforeEach` or `afterAll` hooks

**Problem:** Prisma client not generated
- **Solution:** Run `npx prisma generate`

## Best Practices Summary

1. **Use the right tool:**
   - E2E tests → Playwright (complete user flows)
   - Integration tests → Vitest (Server Actions, API routes)
   - Component tests → Vitest + React Testing Library (UI components)

2. **Test naming convention:**
   - E2E: `*.spec.ts` in `e2e/`
   - Integration: `*.test.ts` in `__tests__/integration/`
   - Components: `*.test.tsx` in `__tests__/components/`

3. **Keep tests isolated:**
   - Each test should be independent
   - Clean up test data after tests
   - Don't rely on test execution order

4. **Use descriptive test names:**
   ```typescript
   // Good
   it('should redirect to login when accessing cart without authentication', ...)

   // Bad
   it('works', ...)
   ```

5. **Test user behavior, not implementation:**
   ```typescript
   // Good - tests behavior
   expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()

   // Bad - tests implementation
   expect(component.state.isSubmitting).toBe(false)
   ```

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing)

## Getting Help

If you encounter issues:
1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Check the official documentation for each tool
3. Search GitHub issues for the specific testing library
4. Ask in the project's discussion forum or Slack channel
