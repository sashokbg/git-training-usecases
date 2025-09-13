import {expect, test} from '@playwright/test';

function editorReadyEvent(page) {
  return page.evaluate(() => {
    return new Promise((resolve) => {
      return document.addEventListener('editor-set', () => {
        return resolve(true);
      });
    })
  });
}

test('Change Editor', async ({page}) => {
  await page.goto('http://localhost:5173/');

  let readyEvent = page.evaluate(() => {
    return new Promise((resolve) => {
      return document.addEventListener('editor-set', () => {
        return resolve(true);
      });
    })
  });
  await page.getByRole('button', {name: 'Vim'}).click();
  await readyEvent;
  await page.locator('css=button#read-editor-btn').click();
  await expect(page.locator('css=.editor-value')).toHaveText("vim");

  readyEvent = editorReadyEvent(page);
  await page.getByRole('button', {name: 'Nano'}).click();
  await readyEvent;
  await page.locator('css=button#read-editor-btn').click();
  await expect(page.locator('css=.editor-value')).toHaveText("nano");
});
