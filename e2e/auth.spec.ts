import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  // Generate unique email for each test run to avoid conflicts
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  const testPassword = 'Test123456!';
  const testName = 'Test User';

  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
  });

  test('should register a new user successfully', async ({ page }) => {
    // Click on Register/Sign up link
    await page.click('text=Register');
    await expect(page).toHaveURL(/.*register/);

    // Fill in registration form
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to /menu after successful registration
    await expect(page).toHaveURL(/.*menu/, { timeout: 10000 });

    // Should show user is logged in (check for logout button or user name)
    await expect(page.locator('text=Logout')).toBeVisible();
  });

  test('should login with existing credentials', async ({ page }) => {
    // Use staff account from seed
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);

    // Fill in login form with seeded staff user
    await page.fill('input[name="email"]', 'staff@coffee.com');
    await page.fill('input[name="password"]', 'staff123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to /menu or /staff after successful login
    await page.waitForURL(/\/(menu|staff)/, { timeout: 10000 });

    // Should show user is logged in
    await expect(page.locator('text=Logout')).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);

    // Try to login with invalid credentials
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Should stay on login page
    await expect(page).toHaveURL(/.*login/);

    // Should show error message (adjust selector based on your error display)
    await expect(page.locator('text=/Invalid|incorrect|failed/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'staff@coffee.com');
    await page.fill('input[name="password"]', 'staff123');
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForURL(/\/(menu|staff)/, { timeout: 10000 });

    // Click logout
    await page.click('text=Logout');

    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });

    // Should show login form
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Login
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'staff@coffee.com');
    await page.fill('input[name="password"]', 'staff123');
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL(/\/(menu|staff)/, { timeout: 10000 });

    // Reload the page
    await page.reload();

    // Should still be authenticated (logout button visible)
    await expect(page.locator('text=Logout')).toBeVisible();

    // Try to access protected route
    await page.goto('/cart');
    await expect(page).toHaveURL(/.*cart/);
  });

  test('should redirect unauthenticated users from protected routes', async ({
    page,
  }) => {
    // Try to access cart without logging in
    await page.goto('/cart');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });

  test('should prevent duplicate email registration', async ({ page }) => {
    // Try to register with existing email (staff@coffee.com from seed)
    await page.click('text=Register');
    await page.fill('input[name="name"]', 'Another User');
    await page.fill('input[name="email"]', 'staff@coffee.com');
    await page.fill('input[name="password"]', 'Test123456!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error about duplicate email
    await expect(
      page.locator('text=/already exists|already registered/i')
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Role-Based Access Control', () => {
  test('CUSTOMER should not access staff routes', async ({ page }) => {
    // Login as customer (you may need to create a customer seed first)
    // For now, we'll register a new customer
    const customerEmail = `customer${Date.now()}@example.com`;

    await page.goto('/register');
    await page.fill('input[name="name"]', 'Customer User');
    await page.fill('input[name="email"]', customerEmail);
    await page.fill('input[name="password"]', 'Customer123!');
    await page.click('button[type="submit"]');

    // Wait for successful registration
    await page.waitForURL(/.*menu/, { timeout: 10000 });

    // Try to access staff route
    await page.goto('/staff');

    // Should redirect to /menu or show forbidden error
    await expect(page).not.toHaveURL(/.*staff/);
  });

  test('STAFF should access staff routes', async ({ page }) => {
    // Login as staff
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@coffee.com');
    await page.fill('input[name="password"]', 'staff123');
    await page.click('button[type="submit"]');

    // Navigate to staff dashboard
    await page.goto('/staff');

    // Should successfully access staff route
    await expect(page).toHaveURL(/.*staff/);
  });
});
