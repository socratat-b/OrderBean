import { test, expect } from '@playwright/test';

/**
 * Debug test to verify SSE + Redis integration
 *
 * This test helps diagnose issues with the real-time update system
 */

test.describe('Debug: SSE + Redis Connection', () => {
  test('should establish SSE connection on staff dashboard', async ({ page }) => {
    console.log('\n=== Testing SSE Connection ===\n');

    // Monitor network requests BEFORE navigating
    let sseConnectionEstablished = false;
    let sseResponseReceived = false;

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/sse/staff/orders')) {
        console.log('✓ SSE request detected:', url);
        sseConnectionEstablished = true;
      }
    });

    // Login as staff
    console.log('[1] Logging in as staff...');
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'staff@coffee.com');
    await page.fill('input[name="password"]', 'staff123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(staff|menu)/, { timeout: 10000 });

    // Navigate to staff dashboard
    console.log('[2] Navigating to staff dashboard...');
    await page.goto('http://localhost:3000/staff');
    await page.waitForSelector('h1:has-text("Staff Dashboard")', { timeout: 10000 });

    // Monitor network requests to see if SSE connection is established
    console.log('[3] Monitoring SSE connection...');

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/sse/staff/orders')) {
        console.log('✓ SSE response received:', {
          url,
          status: response.status(),
          headers: response.headers(),
        });
      }
    });

    // Wait for SSE connection
    await page.waitForTimeout(5000);

    // Check if connection indicator is visible
    const liveIndicator = page.locator('text=/Live updates|Connecting/i');
    const isConnected = await liveIndicator.isVisible({ timeout: 5000 }).catch(() => false);

    console.log('[4] SSE Connection Status:', {
      requestMade: sseConnectionEstablished,
      indicatorVisible: isConnected,
    });

    expect(sseConnectionEstablished).toBe(true);
    console.log('\n✅ SSE connection test PASSED\n');
  });

  test('should receive keepalive messages from SSE', async ({ page, context }) => {
    console.log('\n=== Testing SSE Keepalive Messages ===\n');

    // Login as staff
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'staff@coffee.com');
    await page.fill('input[name="password"]', 'staff123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(staff|menu)/, { timeout: 10000 });

    // Navigate to staff dashboard
    await page.goto('http://localhost:3000/staff');
    await page.waitForSelector('h1:has-text("Staff Dashboard")', { timeout: 10000 });

    // Listen for console logs from the page
    const consoleLogs: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('SSE') || text.includes('Staff') || text.includes('Connected')) {
        consoleLogs.push(text);
        console.log('[BROWSER LOG]', text);
      }
    });

    // Wait for keepalive or connection message
    await page.waitForTimeout(35000); // Keepalive every 30s

    console.log('\nConsole logs captured:', consoleLogs.length);
    consoleLogs.forEach((log) => console.log('  -', log));
  });

  test('should verify Redis environment variables', async ({ page }) => {
    console.log('\n=== Checking Redis Configuration ===\n');

    // Login as staff
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'staff@coffee.com');
    await page.fill('input[name="password"]', 'staff123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(staff|menu)/, { timeout: 10000 });

    // Create a test API endpoint check
    console.log('[1] Checking if Redis is configured...');

    // Navigate to staff dashboard
    await page.goto('http://localhost:3000/staff');

    // Monitor server logs via network
    const apiResponses: any[] = [];

    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        const status = response.status();
        const url = response.url();

        apiResponses.push({ url, status });

        // Check for Redis errors
        if (status >= 500) {
          try {
            const body = await response.text();
            if (body.includes('Redis') || body.includes('UPSTASH')) {
              console.log('⚠️  Redis error detected:', body);
            }
          } catch (e) {
            // Ignore
          }
        }
      }
    });

    await page.waitForTimeout(5000);

    console.log('\nAPI responses captured:', apiResponses.length);
    apiResponses.forEach((resp) => {
      console.log(`  - ${resp.url} → ${resp.status}`);
    });

    // Check if SSE endpoint returns 200
    const sseResponse = apiResponses.find((r) => r.url.includes('/api/sse/staff/orders'));
    if (sseResponse) {
      expect(sseResponse.status).toBe(200);
      console.log('✓ SSE endpoint responding correctly');
    }
  });

  test('should display initial order count correctly', async ({ page }) => {
    console.log('\n=== Verifying Initial Order Count ===\n');

    // Login as staff
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'staff@coffee.com');
    await page.fill('input[name="password"]', 'staff123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(staff|menu)/, { timeout: 10000 });

    // Navigate to staff dashboard
    await page.goto('http://localhost:3000/staff');
    await page.waitForSelector('h1:has-text("Staff Dashboard")', { timeout: 10000 });

    // Wait for orders to load
    await page.waitForTimeout(3000);

    // Get total count
    const totalText = await page.locator('text=/total orders$/i').first().textContent();
    console.log('Total orders text:', totalText);

    const totalMatch = totalText?.match(/(\d+)\s+total orders/i);
    const totalCount = totalMatch ? parseInt(totalMatch[1]) : 0;
    console.log('Total count:', totalCount);

    // Get ALL filter count
    const allButton = page.locator('button:has-text("ALL")').first();
    const allText = await allButton.textContent();
    console.log('ALL filter text:', allText);

    const allMatch = allText?.match(/ALL\s*\((\d+)\)/);
    const allCount = allMatch ? parseInt(allMatch[1]) : 0;
    console.log('ALL count:', allCount);

    // Get PENDING filter count
    const pendingButton = page.locator('button:has-text("PENDING")').first();
    const pendingText = await pendingButton.textContent();
    console.log('PENDING filter text:', pendingText);

    const pendingMatch = pendingText?.match(/PENDING\s*\((\d+)\)/);
    const pendingCount = pendingMatch ? parseInt(pendingMatch[1]) : 0;
    console.log('PENDING count:', pendingCount);

    // Verify counts make sense
    expect(totalCount).toBeGreaterThanOrEqual(0);
    expect(allCount).toBe(totalCount); // ALL should equal total
    expect(pendingCount).toBeGreaterThanOrEqual(0);
    expect(pendingCount).toBeLessThanOrEqual(allCount); // PENDING should be <= ALL

    console.log('\n✅ Order counts are consistent:\n');
    console.log(`   Total: ${totalCount}`);
    console.log(`   ALL: ${allCount}`);
    console.log(`   PENDING: ${pendingCount}`);
  });
});
