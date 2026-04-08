const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8003';

test.describe('Taiwan MRT PWA', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for it to be ready
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('page loads with title containing "MRT"', async ({ page }) => {
    await expect(page).toHaveTitle(/MRT/);

    // Check the h1 heading as well
    const heading = page.locator('#page-title');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/MRT|捷運/);
  });

  test('has no cross-app links (standalone app)', async ({ page }) => {
    // Check that there are no links to other transport apps
    const crossAppLinks = [
      'ubike.html',
      'bus.html',
      'rail.html',
      'thsr.html',
      'oil.html',
      'weather.html',
      'earthquake.html'
    ];

    for (const link of crossAppLinks) {
      const linkCount = await page.locator(`a[href*="${link}"]`).count();
      expect(linkCount).toBe(0);
    }
  });

  test('map container exists and is visible', async ({ page }) => {
    const mapContainer = page.locator('#map-container');
    await expect(mapContainer).toBeVisible();

    const mapCanvas = page.locator('#map-canvas');
    await expect(mapCanvas).toBeVisible();
  });

  test('Leaflet map initializes successfully', async ({ page }) => {
    // Wait for Leaflet to be loaded
    await page.waitForFunction(() => typeof window.L !== 'undefined');

    // Check that map instance exists
    const hasMap = await page.evaluate(() => {
      return typeof window.map !== 'undefined' && window.map !== null;
    });
    expect(hasMap).toBe(true);

    // Check that Leaflet container has the leaflet-container class
    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible();
  });

  test('system filter dropdown exists with all systems', async ({ page }) => {
    const systemSelect = page.locator('#system-select');
    await expect(systemSelect).toBeVisible();

    // Check that all MRT systems are present
    const systems = ['TRTC', 'KRTC', 'TYMC', 'TMRT'];
    for (const system of systems) {
      const option = systemSelect.locator(`option[value="${system}"]`);
      await expect(option).toBeAttached();
    }

    // Check "All Systems" option exists
    const allOption = systemSelect.locator('option[value="all"]');
    await expect(allOption).toBeAttached();
  });

  test('line filter dropdown exists', async ({ page }) => {
    const lineSelect = page.locator('#line-select');
    await expect(lineSelect).toBeVisible();

    // Should have at least "All Lines" option
    const allLinesOption = lineSelect.locator('option[value="all"]');
    await expect(allLinesOption).toBeAttached();
  });

  test('search input exists', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /search/i);
  });

  test('station list/panel exists', async ({ page }) => {
    const panel = page.locator('#panel');
    await expect(panel).toBeVisible();

    const stationList = page.locator('#station-list');
    await expect(stationList).toBeVisible();
  });

  test('station data is loaded and displayed', async ({ page }) => {
    // Wait for stations to be rendered
    await page.waitForSelector('#station-list li', { timeout: 10000 });

    const stationItems = page.locator('#station-list li');
    const count = await stationItems.count();

    // Should have multiple stations loaded (Taipei Metro default has 131 stations)
    expect(count).toBeGreaterThan(50);

    // Check result count display
    const resultCount = page.locator('#result-count');
    await expect(resultCount).toBeVisible();
    await expect(resultCount).toContainText(/\d+/);
  });

  test('language toggle button exists and works', async ({ page }) => {
    const langBtn = page.locator('#lang-btn');
    await expect(langBtn).toBeVisible();

    // Get initial text
    const initialText = await langBtn.textContent();
    expect(['EN', 'ZH', '中文']).toContain(initialText.trim());

    // Click to toggle
    await langBtn.click();
    await page.waitForTimeout(300); // Wait for toggle animation

    // Text should change
    const newText = await langBtn.textContent();
    expect(newText.trim()).not.toBe(initialText.trim());

    // Page title should update
    const heading = page.locator('#page-title');
    await expect(heading).toBeVisible();
  });

  test('locate button exists', async ({ page }) => {
    const locateBtn = page.locator('.locate-btn');
    await expect(locateBtn).toBeVisible();
    await expect(locateBtn).toContainText('📍');
  });

  test('Leaflet markers appear on map', async ({ page }) => {
    // Wait for markers to be added to map
    await page.waitForSelector('.leaflet-marker-icon', { timeout: 10000 });

    const markers = page.locator('.leaflet-marker-icon');
    const markerCount = await markers.count();

    // Should have multiple markers (Taipei Metro has 131 stations by default)
    expect(markerCount).toBeGreaterThan(50);
  });

  test('system filter changes update station list', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('#station-list li', { timeout: 10000 });

    const systemSelect = page.locator('#system-select');
    const stationList = page.locator('#station-list li');

    // Get initial count (Taipei Metro)
    const taipeiCount = await stationList.count();
    expect(taipeiCount).toBeGreaterThan(50);

    // Switch to Kaohsiung Metro
    await systemSelect.selectOption('KRTC');
    await page.waitForTimeout(500); // Wait for filtering

    const kaohsiungCount = await stationList.count();
    // Kaohsiung has fewer stations than Taipei
    expect(kaohsiungCount).toBeLessThan(taipeiCount);
    expect(kaohsiungCount).toBeGreaterThan(30); // Kaohsiung has ~40+ stations
  });

  test('search functionality filters stations', async ({ page }) => {
    await page.waitForSelector('#station-list li', { timeout: 10000 });

    const searchInput = page.locator('#search-input');
    const stationList = page.locator('#station-list li');

    // Get initial count
    const initialCount = await stationList.count();

    // Search for a specific station
    await searchInput.fill('Taipei Main Station');
    await page.waitForTimeout(500); // Wait for debounce/filtering

    const filteredCount = await stationList.count();
    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThan(0);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);

    const restoredCount = await stationList.count();
    expect(restoredCount).toBe(initialCount);
  });

  test('manifest.webapp returns 200', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/manifest.webapp`);
    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application');
  });

  test('sw.js (service worker) returns 200', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/sw.js`);
    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/javascript|text/);
  });

  test('no JavaScript console errors on load', async ({ page }) => {
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for any async operations

    // Filter out common non-critical errors
    const criticalErrors = consoleErrors.filter(error => {
      const lowerError = error.toLowerCase();
      // Ignore service worker registration errors in test environment
      return !lowerError.includes('service worker') &&
             !lowerError.includes('manifest') &&
             !lowerError.includes('failed to register');
    });

    expect(criticalErrors).toHaveLength(0);
  });

  test('clicking a station in list highlights it on map', async ({ page }) => {
    await page.waitForSelector('#station-list li', { timeout: 10000 });

    // Click first station in list
    const firstStation = page.locator('#station-list li').first();
    await firstStation.click();

    // Wait for map to pan/zoom
    await page.waitForTimeout(1000);

    // Check if station name appears in a popup or is highlighted
    // (This assumes the app shows a popup or highlight when clicking)
    const popup = page.locator('.leaflet-popup');
    const popupExists = await popup.count() > 0;

    // At least verify the click doesn't cause errors
    expect(popupExists).toBeTruthy();
  });

  test('mobile bottom sheet elements exist', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Bottom sheet components
    const sheetHandle = page.locator('.sheet-handle');
    await expect(sheetHandle).toBeAttached();

    const sheetPill = page.locator('.sheet-pill');
    await expect(sheetPill).toBeAttached();

    const sheetSummary = page.locator('#sheet-summary');
    await expect(sheetSummary).toBeAttached();

    const sheetContent = page.locator('.sheet-content');
    await expect(sheetContent).toBeAttached();
  });

  test('result count updates when filtering', async ({ page }) => {
    await page.waitForSelector('#station-list li', { timeout: 10000 });

    const resultCount = page.locator('#result-count');
    await expect(resultCount).toBeVisible();

    // Get initial count text
    const initialText = await resultCount.textContent();
    expect(initialText).toMatch(/\d+/);

    // Change system filter
    const systemSelect = page.locator('#system-select');
    await systemSelect.selectOption('TYMC'); // Taoyuan Metro (smaller)
    await page.waitForTimeout(500);

    // Count should update
    const newText = await resultCount.textContent();
    expect(newText).toMatch(/\d+/);
    expect(newText).not.toBe(initialText);
  });

  test('PWA meta tags are present', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for PWA-related meta tags
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();

    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeTruthy();

    const appleCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]').getAttribute('content');
    expect(appleCapable).toBe('yes');

    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();
    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBe('manifest.webapp');
  });

  test('Leaflet CSS is loaded', async ({ page }) => {
    const leafletCss = page.locator('link[href*="leaflet"][href*=".css"]');
    await expect(leafletCss).toBeAttached();
  });

  test('bottom sheet script is loaded', async ({ page }) => {
    const bottomSheetScript = page.locator('script[src*="bottom-sheet.js"]');
    await expect(bottomSheetScript).toBeAttached();
  });

  test('page has proper semantic structure', async ({ page }) => {
    // Check for header
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check for main content area
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();

    // Check for heading hierarchy
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });
});
