import {
  expect,
  test,
} from '@playwright/test'

test(
  'carrega a home do marketplace',
  async ({ page }) => {
    await page.goto('/')

    await expect(
      page,
    ).toHaveTitle(
      /kurio/i,
    )

    await expect(
      page.locator('body'),
    ).toBeVisible()
  },
)