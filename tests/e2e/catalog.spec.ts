import {
  expect,
  test,
} from '@playwright/test'

test(
  'navega do catálogo para o detalhe do NFT',
  async ({ page }) => {
    await page.goto('/')

    const firstNftLink =
      page
        .locator(
          '#catalog article a',
        )
        .first()

    await expect(
      firstNftLink,
    ).toBeVisible()

    const nftName =
      await firstNftLink
        .locator('h3')
        .innerText()

    await firstNftLink.click()

    await expect(
      page,
    ).toHaveURL(
      /\/nft\/.+/,
    )

    await expect(
      page.getByText(
        nftName,
        {
          exact: true,
        },
      ),
    ).toBeVisible()
  },
)