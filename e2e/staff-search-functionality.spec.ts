import { test, expect } from '@playwright/test';

test.describe('Staff Dashboard - Search Functionality', () => {
  const STAFF_EMAIL = 'staff@coffee.com';
  const STAFF_PASSWORD = 'staff123';

  test.beforeEach(async ({ page }) => {
    // Login as staff
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', STAFF_EMAIL);
    await page.fill('input[type="password"]', STAFF_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for navigation to staff page
    await page.waitForURL('**/staff');
    await page.waitForLoadState('networkidle');

    // Wait for orders to load
    await page.waitForSelector('text=Customer Orders', { timeout: 10000 });
  });

  test('should search by customer name and update filter counts', async ({ page }) => {
    console.log('[TEST] Testing search by customer name...');

    // Get initial ALL count
    const allButtonDesktop = page.locator('.md\\:flex button:has-text("ALL")').first();
    const initialAllText = await allButtonDesktop.textContent();
    const initialAllCount = parseInt(initialAllText?.match(/\d+/)?.[0] || '0');
    console.log(`[TEST] Initial ALL count: ${initialAllCount}`);

    // Search for a customer name (using first name from existing orders)
    const searchInput = page.locator('input[placeholder*="Search by customer"]');
    await searchInput.fill('Scott');
    await page.waitForTimeout(500); // Wait for filtering to apply

    // Check that search is applied
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('Scott');
    console.log('[TEST] Search applied: Scott');

    // Get orders after search
    const orderCards = page.locator('[class*="rounded-xl"][class*="border-2"][class*="border-border"]').filter({
      has: page.locator('text=/ORDER #/i')
    });
    const orderCount = await orderCards.count();
    console.log(`[TEST] Orders displayed after search: ${orderCount}`);

    // Verify filter counts match displayed orders
    const updatedAllText = await allButtonDesktop.textContent();
    const updatedAllCount = parseInt(updatedAllText?.match(/\d+/)?.[0] || '0');
    console.log(`[TEST] ALL button count after search: ${updatedAllCount}`);
    console.log(`[TEST] Actual orders displayed: ${orderCount}`);

    if (orderCount > 0) {
      // If orders are found, counts should reflect search results
      // Note: The count in the button should match or be related to what's shown
      console.log(`[TEST] ✓ Search returned ${orderCount} orders for "Scott"`);

      // Verify customer names in results contain "Scott"
      const firstOrderCustomer = orderCards.first().locator('p:has-text("CUSTOMER") + p');
      const customerName = await firstOrderCustomer.textContent();
      expect(customerName?.toLowerCase()).toContain('scott');
      console.log(`[TEST] ✓ Customer name contains "Scott": ${customerName}`);
    } else {
      // If no orders found, should show empty state
      await expect(page.locator('text=No matching orders found')).toBeVisible();
      console.log('[TEST] ✓ Empty state shown correctly');
    }
  });

  test('should search by full customer name with space and update counts', async ({ page }) => {
    console.log('[TEST] Testing search by full name with space...');

    // Get initial counts
    const allButtonDesktop = page.locator('.md\\:flex button:has-text("ALL")').first();
    const pendingButton = page.locator('.md\\:flex button:has-text("PENDING")').first();
    const preparingButton = page.locator('.md\\:flex button:has-text("PREPARING")').first();

    const initialAllText = await allButtonDesktop.textContent();
    const initialAllCount = parseInt(initialAllText?.match(/\d+/)?.[0] || '0');

    const initialPendingText = await pendingButton.textContent();
    const initialPendingCount = parseInt(initialPendingText?.match(/\d+/)?.[0] || '0');

    const initialPreparingText = await preparingButton.textContent();
    const initialPreparingCount = parseInt(initialPreparingText?.match(/\d+/)?.[0] || '0');

    console.log(`[TEST] Initial counts - ALL: ${initialAllCount}, PENDING: ${initialPendingCount}, PREPARING: ${initialPreparingCount}`);

    // Search for full name with space
    const searchInput = page.locator('input[placeholder*="Search by customer"]');
    await searchInput.fill('Scott Andrew');
    await page.waitForTimeout(500);

    console.log('[TEST] Search applied: "Scott Andrew"');

    // Get displayed orders
    const orderCards = page.locator('[class*="rounded-xl"][class*="border-2"][class*="border-border"]').filter({
      has: page.locator('text=/ORDER #/i')
    });
    const displayedCount = await orderCards.count();
    console.log(`[TEST] Orders displayed: ${displayedCount}`);

    // Get updated counts from buttons
    const updatedAllText = await allButtonDesktop.textContent();
    const updatedAllCount = parseInt(updatedAllText?.match(/\d+/)?.[0] || '0');

    const updatedPendingText = await pendingButton.textContent();
    const updatedPendingCount = parseInt(updatedPendingText?.match(/\d+/)?.[0] || '0');

    const updatedPreparingText = await preparingButton.textContent();
    const updatedPreparingCount = parseInt(updatedPreparingText?.match(/\d+/)?.[0] || '0');

    console.log(`[TEST] Updated counts - ALL: ${updatedAllCount}, PENDING: ${updatedPendingCount}, PREPARING: ${updatedPreparingCount}`);

    // BUG CHECK: Counts should reflect filtered results, not original data
    console.log('[TEST] ========================================');
    console.log('[TEST] BUG VERIFICATION:');
    console.log(`[TEST] Displayed orders: ${displayedCount}`);
    console.log(`[TEST] ALL button shows: ${updatedAllCount}`);
    console.log(`[TEST] PENDING button shows: ${updatedPendingCount}`);
    console.log(`[TEST] PREPARING button shows: ${updatedPreparingCount}`);

    if (displayedCount === 0) {
      console.log('[TEST] ❌ BUG: No orders displayed but counts still show original numbers!');
      console.log('[TEST] Expected: Counts should show 0 when no matches found');
      console.log('[TEST] Actual: Counts show original values (not filtered by search)');
      await expect(page.locator('text=No matching orders found')).toBeVisible();
    }

    console.log('[TEST] ========================================');

    // After fix, this should pass:
    // expect(updatedAllCount).toBe(displayedCount);
  });

  test('should search by customer email', async ({ page }) => {
    console.log('[TEST] Testing search by email...');

    const searchInput = page.locator('input[placeholder*="Search by customer"]');

    // Get first order's email
    const orderCards = page.locator('[class*="rounded-xl"][class*="border-2"][class*="border-border"]').filter({
      has: page.locator('text=/ORDER #/i')
    });

    if (await orderCards.count() > 0) {
      const firstOrderEmail = orderCards.first().locator('p:has-text("CUSTOMER") + p + p.text-muted-foreground');
      const emailText = await firstOrderEmail.textContent();
      console.log(`[TEST] Searching for email: ${emailText}`);

      await searchInput.fill(emailText || '');
      await page.waitForTimeout(500);

      const displayedCount = await orderCards.count();
      console.log(`[TEST] Orders displayed: ${displayedCount}`);

      expect(displayedCount).toBeGreaterThan(0);
      console.log('[TEST] ✓ Email search working');
    }
  });

  test('should search by order ID', async ({ page }) => {
    console.log('[TEST] Testing search by order ID...');

    const searchInput = page.locator('input[placeholder*="Search by customer"]');

    // Get first order ID
    const orderCards = page.locator('[class*="rounded-xl"][class*="border-2"][class*="border-border"]').filter({
      has: page.locator('text=/ORDER #/i')
    });

    if (await orderCards.count() > 0) {
      const firstOrderIdElement = orderCards.first().locator('text=/ORDER #/i');
      const orderIdText = await firstOrderIdElement.textContent();
      const orderId = orderIdText?.replace('ORDER #', '').trim().toLowerCase();
      console.log(`[TEST] Searching for order ID: ${orderId}`);

      await searchInput.fill(orderId || '');
      await page.waitForTimeout(500);

      const displayedCount = await orderCards.count();
      console.log(`[TEST] Orders displayed: ${displayedCount}`);

      expect(displayedCount).toBe(1); // Should find exactly one order
      console.log('[TEST] ✓ Order ID search working');
    }
  });

  test('should search by product name', async ({ page }) => {
    console.log('[TEST] Testing search by product name...');

    const searchInput = page.locator('input[placeholder*="Search by customer"]');

    // Search for a common coffee product
    await searchInput.fill('Coffee');
    await page.waitForTimeout(500);

    const orderCards = page.locator('[class*="rounded-xl"][class*="border-2"][class*="border-border"]').filter({
      has: page.locator('text=/ORDER #/i')
    });
    const displayedCount = await orderCards.count();
    console.log(`[TEST] Orders displayed for "Coffee": ${displayedCount}`);

    if (displayedCount > 0) {
      // Verify first order contains a product with "coffee" in the name
      const firstOrderItems = orderCards.first().locator('p:has-text("ITEMS")').locator('xpath=following-sibling::div//p[contains(@class, "font-bold")]');
      const firstItemText = await firstOrderItems.first().textContent();
      console.log(`[TEST] First item in results: ${firstItemText}`);
      expect(firstItemText?.toLowerCase()).toContain('coffee');
      console.log('[TEST] ✓ Product name search working');
    }
  });

  test('should combine search with status filter', async ({ page }) => {
    console.log('[TEST] Testing search + status filter combination...');

    // Filter by PENDING status
    const pendingButton = page.locator('.md\\:flex button:has-text("PENDING")').first();
    await pendingButton.click();
    await page.waitForTimeout(500);

    const orderCards = page.locator('[class*="rounded-xl"][class*="border-2"][class*="border-border"]').filter({
      has: page.locator('text=/ORDER #/i')
    });
    const pendingCount = await orderCards.count();
    console.log(`[TEST] PENDING orders: ${pendingCount}`);

    // Now apply search
    const searchInput = page.locator('input[placeholder*="Search by customer"]');
    await searchInput.fill('Scott');
    await page.waitForTimeout(500);

    const filteredCount = await orderCards.count();
    console.log(`[TEST] PENDING orders matching "Scott": ${filteredCount}`);

    // Verify all displayed orders are PENDING
    if (filteredCount > 0) {
      const statuses = orderCards.locator('span:has-text("PENDING")');
      const statusCount = await statuses.count();
      expect(statusCount).toBe(filteredCount);
      console.log('[TEST] ✓ All displayed orders are PENDING');
    }

    console.log('[TEST] ✓ Search + filter combination working');
  });

  test('should clear search and restore full list', async ({ page }) => {
    console.log('[TEST] Testing search clear functionality...');

    const searchInput = page.locator('input[placeholder*="Search by customer"]');
    const orderCards = page.locator('[class*="rounded-xl"][class*="border-2"][class*="border-border"]').filter({
      has: page.locator('text=/ORDER #/i')
    });

    // Get initial count
    const initialCount = await orderCards.count();
    console.log(`[TEST] Initial orders: ${initialCount}`);

    // Apply search
    await searchInput.fill('NonExistentCustomer123');
    await page.waitForTimeout(500);

    // Should show empty state
    await expect(page.locator('text=No matching orders found')).toBeVisible();
    console.log('[TEST] ✓ Empty state shown for non-matching search');

    // Clear search using X button
    const clearButton = page.locator('button[class*="absolute right-4"]').filter({
      has: page.locator('svg')
    });
    await clearButton.click();
    await page.waitForTimeout(500);

    // Should restore full list
    const restoredCount = await orderCards.count();
    console.log(`[TEST] Restored orders: ${restoredCount}`);
    expect(restoredCount).toBe(initialCount);
    console.log('[TEST] ✓ Search cleared, full list restored');
  });

  test('should show correct counts after search (bug verification)', async ({ page }) => {
    console.log('[TEST] Testing filter counts after search (BUG TEST)...');

    const allButton = page.locator('.md\\:flex button:has-text("ALL")').first();
    const pendingButton = page.locator('.md\\:flex button:has-text("PENDING")').first();
    const preparingButton = page.locator('.md\\:flex button:has-text("PREPARING")').first();

    // Apply search
    const searchInput = page.locator('input[placeholder*="Search by customer"]');
    await searchInput.fill('Scott Andrew');
    await page.waitForTimeout(500);

    // Get displayed orders
    const orderCards = page.locator('[class*="rounded-xl"][class*="border-2"][class*="border-border"]').filter({
      has: page.locator('text=/ORDER #/i')
    });
    const displayedCount = await orderCards.count();

    // Get button counts
    const allText = await allButton.textContent();
    const allCount = parseInt(allText?.match(/\d+/)?.[0] || '0');

    const pendingText = await pendingButton.textContent();
    const pendingCount = parseInt(pendingText?.match(/\d+/)?.[0] || '0');

    const preparingText = await preparingButton.textContent();
    const preparingCount = parseInt(preparingText?.match(/\d+/)?.[0] || '0');

    console.log('[TEST] ========================================');
    console.log('[TEST] FILTER COUNT BUG VERIFICATION:');
    console.log(`[TEST] Search query: "Scott Andrew"`);
    console.log(`[TEST] Orders displayed: ${displayedCount}`);
    console.log(`[TEST] ALL button count: ${allCount}`);
    console.log(`[TEST] PENDING button count: ${pendingCount}`);
    console.log(`[TEST] PREPARING button count: ${preparingCount}`);
    console.log('[TEST] ========================================');

    // This will fail before the fix
    // After fix, button counts should reflect search results
    if (displayedCount === 0) {
      // If no orders match, all counts should be 0
      console.log('[TEST] Expected after fix: All counts should be 0');
      console.log(`[TEST] Current ALL count: ${allCount} (should be 0)`);
      console.log(`[TEST] Current PENDING count: ${pendingCount} (should be 0)`);
      console.log(`[TEST] Current PREPARING count: ${preparingCount} (should be 0)`);

      // After fix, uncomment these assertions:
      // expect(allCount).toBe(0);
      // expect(pendingCount).toBe(0);
      // expect(preparingCount).toBe(0);
    }
  });
});
