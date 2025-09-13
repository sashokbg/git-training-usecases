// @ts-check
import {expect, test} from '@playwright/test';

test('Initialize Shell', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  const firstExercise = page.locator('.sidebar .sidebar-item').first();
  await expect(firstExercise).toBeVisible();
  await firstExercise.click();

  await expect(page.locator('.exercise-content')).toBeVisible();

  const startButton = page.getByRole('button', { name: /start/i });
  await expect(startButton).toBeVisible();
  await expect(startButton).toBeEnabled();
  await startButton.click();


  // Assert the status indicator shows successful shell initialization
  const statusIndicator = page.locator('div.status-indicator');
  await expect(statusIndicator).toBeVisible();
  await expect(statusIndicator).toContainText('Shell Initialized', { timeout: 5000 });
});
