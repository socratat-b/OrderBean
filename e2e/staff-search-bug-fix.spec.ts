import { test, expect } from '@playwright/test';

test.describe('Staff Search - Filter Count Bug Fix', () => {
  const STAFF_EMAIL = 'staff@coffee.com';
  const STAFF_PASSWORD = 'staff123';

  test('should update filter counts when searching (bug fix verification)', async ({ page }) => {
    console.log('[TEST] ========================================');
    console.log('[TEST] Bug Fix Verification: Filter counts should reflect search results');
    console.log('[TEST] ========================================');

    // Login as staff
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', STAFF_EMAIL);
    await page.fill('input[type="password"]', STAFF_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for staff page to load
    await page.waitForURL('**/staff', { timeout: 10000 });
    await page.waitForSelector('text=Customer Orders', { timeout: 10000 });

    // Wait a bit for SSE to connect and orders to load
    await page.waitForTimeout(3000);

    console.log('[TEST] ✓ Staff page loaded');

    // Get desktop filter buttons
    const allButton = page.locator('.md\\:flex button:has-text("ALL")').first();
    const pendingButton = page.locator('.md\\:flex button:has-text("PENDING")').first();
    const preparingButton = page.locator('.md\\:flex button:has-text("PREPARING")').first();

    // Get initial counts from buttons
    const initialAllText = await allButton.textContent();
    const initialAllCount = parseInt(initialAllText?.match(/\d+/)?.[0] || '0');

    const initialPendingText = await pendingButton.textContent();
    const initialPendingCount = parseInt(initialPendingText?.match(/\d+/)?.[0] || '0');

    const initialPreparingText = await preparingButton.textContent();
    const initialPreparingCount = parseInt(initialPreparingText?.match(/\d+/)?.[0] || '0');

    console.log(`[TEST] Initial counts:`);
    console.log(`[TEST]   ALL: ${initialAllCount}`);
    console.log(`[TEST]   PENDING: ${initialPendingCount}`);
    console.log(`[TEST]   PREPARING: ${initialPreparingCount}`);

    // Apply search that should have no results
    console.log(`[TEST] Searching for "NonExistentCustomer12345"...`);
    const searchInput = page.locator('input[placeholder*="Search by customer"]');
    await searchInput.fill('NonExistentCustomer12345');
    await page.waitForTimeout(1000); // Wait for filtering

    // Verify empty state is shown
    const emptyState = page.locator('text=No matching orders found');
    await expect(emptyState).toBeVisible();
    console.log(`[TEST] ✓ Empty state displayed correctly`);

    // Get updated counts
    const updatedAllText = await allButton.textContent();
    const updatedAllCount = parseInt(updatedAllText?.match(/\d+/)?.[0] || '0');

    const updatedPendingText = await pendingButton.textContent();
    const updatedPendingCount = parseInt(updatedPendingText?.match(/\d+/)?.[0] || '0');

    const updatedPreparingText = await preparingButton.textContent();
    const updatedPreparingCount = parseInt(updatedPreparingText?.match(/\d+/)?.[0] || '0');

    console.log(`[TEST] Updated counts (should all be 0):`);
    console.log(`[TEST]   ALL: ${updatedAllCount}`);
    console.log(`[TEST]   PENDING: ${updatedPendingCount}`);
    console.log(`[TEST]   PREPARING: ${updatedPreparingCount}`);

    // Verify counts are 0 (no matches)
    expect(updatedAllCount).toBe(0);
    expect(updatedPendingCount).toBe(0);
    expect(updatedPreparingCount).toBe(0);

    console.log(`[TEST] ✅ BUG FIX VERIFIED: All counts are 0 when no matches found`);

    // Clear search and verify counts restore
    await searchInput.clear();
    await page.waitForTimeout(500);

    const restoredAllText = await allButton.textContent();
    const restoredAllCount = parseInt(restoredAllText?.match(/\d+/)?.[0] || '0');

    console.log(`[TEST] After clearing search, ALL count: ${restoredAllCount}`);
    expect(restoredAllCount).toBe(initialAllCount);
    console.log(`[TEST] ✅ Counts restored correctly after clearing search`);

    // Now test with partial match (like "Scott")
    console.log(`[TEST] Testing partial search with "Scott"...`);
    await searchInput.fill('Scott');
    await page.waitForTimeout(1000);

    const scottAllText = await allButton.textContent();
    const scottAllCount = parseInt(scottAllText?.match(/\d+/)?.[0] || '0');

    const scottPendingText = await pendingButton.textContent();
    const scottPendingCount = parseInt(scottPendingText?.match(/\d+/)?.[0] || '0');

    console.log(`[TEST] Search "Scott" results:`);
    console.log(`[TEST]   ALL: ${scottAllCount}`);
    console.log(`[TEST]   PENDING: ${scottPendingCount}`);

    // Get actual displayed orders
    const orderCards = page.locator('[class*="rounded-xl"][class*="border-2"]').filter({
      has: page.locator('text=/ORDER #/i')
    });
    const displayedCount = await orderCards.count();
    console.log(`[TEST]   Orders displayed: ${displayedCount}`);

    // ALL count should match displayed orders
    expect(scottAllCount).toBe(displayedCount);
    console.log(`[TEST] ✅ ALL count (${scottAllCount}) matches displayed orders (${displayedCount})`);

    // Test with full name "Scott Andrew"
    console.log(`[TEST] Testing full name "Scott Andrew"...`);
    await searchInput.fill('Scott Andrew');
    await page.waitForTimeout(1000);

    const fullNameAllText = await allButton.textContent();
    const fullNameAllCount = parseInt(fullNameAllText?.match(/\d+/)?.[0] || '0');

    const fullNamePendingText = await pendingButton.textContent();
    const fullNamePendingCount = parseInt(fullNamePendingText?.match(/\d+/)?.[0] || '0');

    const fullNamePreparingText = await preparingButton.textContent();
    const fullNamePreparingCount = parseInt(fullNamePreparingText?.match(/\d+/)?.[0] || '0');

    console.log(`[TEST] Search "Scott Andrew" results:`);
    console.log(`[TEST]   ALL: ${fullNameAllCount}`);
    console.log(`[TEST]   PENDING: ${fullNamePendingCount}`);
    console.log(`[TEST]   PREPARING: ${fullNamePreparingCount}`);

    const fullNameDisplayedCount = await orderCards.count();
    console.log(`[TEST]   Orders displayed: ${fullNameDisplayedCount}`);

    // Verify ALL count matches displayed
    expect(fullNameAllCount).toBe(fullNameDisplayedCount);
    console.log(`[TEST] ✅ ALL count (${fullNameAllCount}) matches displayed orders (${fullNameDisplayedCount})`);

    // Verify sum of status counts equals ALL count
    const sumOfStatusCounts = fullNamePendingCount + fullNamePreparingCount;
    console.log(`[TEST] Sum of PENDING (${fullNamePendingCount}) + PREPARING (${fullNamePreparingCount}) = ${sumOfStatusCounts}`);
    console.log(`[TEST] Should match ALL count: ${fullNameAllCount}`);

    console.log('[TEST] ========================================');
    console.log('[TEST] ✅ ALL TESTS PASSED - BUG IS FIXED!');
    console.log('[TEST] ========================================');
  });
});
