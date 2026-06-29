import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should load the login page', async ({ page }) => {
    // Navigate to the base URL which is the Login page
    await page.goto('/');
    
    // Expect the URL to be exactly the base URL
    await expect(page).toHaveURL('http://127.0.0.1:8080/');
    
    // Expect the title or an element to exist
    await expect(page.locator('text=Sign In').first()).toBeVisible();
  });

  test('should redirect /feed to / when not authenticated', async ({ page }) => {
    await page.goto('/feed');
    // Should be redirected back to the login page (root)
    await expect(page).toHaveURL('http://127.0.0.1:8080/');
  });
});
