import {
  expect,
  test,
  type Page,
} from '@playwright/test'

import {
  resetMockScenario,
} from './helpers/mock-scenario'

type AddedNft = {
  name: string
  href: string
}

async function getCatalogNftHrefs(
  page: Page,
) {
  await page.goto('/')

  const links =
    page.locator(
      '#catalog article a[href^="/nft/"]',
    )

  await expect(
    links.first(),
  ).toBeVisible({
    timeout: 10_000,
  })

  return links.evaluateAll(
    (elements) =>
      Array.from(
        new Set(
          elements
            .map((element) =>
              element.getAttribute(
                'href',
              ),
            )
            .filter(
              (
                href,
              ): href is string =>
                Boolean(href),
            ),
        ),
      ),
  )
}

async function addNftToCart(
  page: Page,
  options?: {
    requireMultipleQuantity?: boolean
  },
): Promise<AddedNft> {
  const hrefs =
    await getCatalogNftHrefs(
      page,
    )

  for (
    const href of hrefs.slice(
      0,
      9,
    )
  ) {
    await page.goto(href)

    const heading =
      page.locator(
        'h1:visible',
      ).first()

    await expect(
      heading,
    ).toBeVisible({
      timeout: 10_000,
    })

    const name =
      (
        await heading.innerText()
      ).trim()

    const buyButton =
      page.getByRole(
        'button',
        {
          name:
            /^COMPRAR(?: NFT)?$/i,
        },
      )

    if (
      !(await buyButton.isVisible()) ||
      !(await buyButton.isEnabled())
    ) {
      continue
    }

    if (
      options?.requireMultipleQuantity
    ) {
      const increaseButton =
        page.getByRole(
          'button',
          {
            name:
              'Aumentar quantidade',
            exact: true,
          },
        )

      if (
        !(await increaseButton.isVisible()) ||
        !(await increaseButton.isEnabled())
      ) {
        continue
      }
    }

    await buyButton.click()

    const addedStatus =
      page
        .locator(
          '[role="status"]:visible',
        )
        .filter({
          hasText:
            /^Item adicionado ao carrinho\.$/,
        })

    await expect(
      addedStatus,
    ).toBeVisible()

    return {
      name,
      href,
    }
  }

  throw new Error(
    'Nenhum NFT adequado foi encontrado para o teste do carrinho.',
  )
}

function getQuantityControls(
  page: Page,
  nftName: string,
) {
  const decreaseButton =
    page.getByRole(
      'button',
      {
        name:
          `Diminuir quantidade de ${nftName}`,
        exact: true,
      },
    )

  const increaseButton =
    page.getByRole(
      'button',
      {
        name:
          `Aumentar quantidade de ${nftName}`,
        exact: true,
      },
    )

  const quantity =
    increaseButton
      .locator('..')
      .locator(
        'span[aria-live="polite"]',
      )

  return {
    decreaseButton,
    increaseButton,
    quantity,
  }
}

function getCouponInput(
  page: Page,
) {
  return page.locator(
    'input[id^="coupon-code"]:visible',
  )
}

function getApplyCouponButton(
  page: Page,
) {
  return page.getByRole(
    'button',
    {
      name: 'Aplicar',
      exact: true,
    },
  )
}

async function getSummaryValue(
  page: Page,
  label:
    | 'subtotal'
    | 'discount'
    | 'networkFee'
    | 'total',
) {
  const patterns = {
    subtotal:
      /^Subtotal$/,

    discount:
      /^Desconto(?: do lançamento)?$/,

    networkFee:
      /^Taxa de rede$/,

    total:
      /^Total$/,
  }

  /*
   * Restringe a busca ao resumo
   * do carrinho.
   *
   * Isso evita confundir "Total"
   * com a coluna "Total" da tabela
   * de itens no desktop.
   */
  const summary =
    page
      .locator(
        'aside:visible',
      )
      .first()

  await expect(
    summary,
  ).toBeVisible()

  const labelElement =
    summary
      .locator(
        'span:visible',
      )
      .filter({
        hasText:
          patterns[label],
      })
      .first()

  await expect(
    labelElement,
  ).toBeVisible()

  /*
   * Desktop e mobile usam
   * estruturas diferentes.
   *
   * O valor pode estar em um
   * span irmão ou em um elemento
   * aninhado, então usamos o
   * texto da linha inteira.
   */
  const row =
    labelElement.locator(
      '..',
    )

  const rowText =
    await row.innerText()

  const numericValues =
    rowText.match(
      /\d+(?:[.,]\d+)?/g,
    )

  if (
    !numericValues ||
    numericValues.length === 0
  ) {
    throw new Error(
      `Não foi possível ler o valor de ${label}: ${rowText}`,
    )
  }

  const numericValue =
    numericValues[
      numericValues.length - 1
    ].replace(
      ',',
      '.',
    )

  return Number(
    numericValue,
  )
}

test.describe(
  'Carrinho',
  () => {
    test(
      'atualiza quantidade, respeita persistência após refresh e remove item',
      async ({
        page,
      }) => {
        await page.goto('/')

        await resetMockScenario(
          page,
        )

        const {
          name,
        } =
          await addNftToCart(
            page,
            {
              requireMultipleQuantity:
                true,
            },
          )

        await page.goto(
          '/cart',
        )

        await expect(
          page.getByRole(
            'heading',
            {
              level: 1,
              name:
                'Seu carrinho',
            },
          ),
        ).toBeVisible()

        const {
          decreaseButton,
          increaseButton,
          quantity,
        } =
          getQuantityControls(
            page,
            name,
          )

        await expect(
          quantity,
        ).toHaveText(
          '1',
        )

        await expect(
          decreaseButton,
        ).toBeDisabled()

        await expect(
          increaseButton,
        ).toBeEnabled()

        await increaseButton.click()

        await expect(
          quantity,
        ).toHaveText(
          '2',
        )

        await expect(
          page.getByText(
            '2 itens no carrinho',
            {
              exact: true,
            },
          ),
        ).toBeVisible()

        await page.reload()

        const controlsAfterReload =
          getQuantityControls(
            page,
            name,
          )

        await expect(
          controlsAfterReload.quantity,
        ).toHaveText(
          '2',
          {
            timeout: 10_000,
          },
        )

        await controlsAfterReload.decreaseButton.click()

        await expect(
          controlsAfterReload.quantity,
        ).toHaveText(
          '1',
        )

        await expect(
          controlsAfterReload.decreaseButton,
        ).toBeDisabled()

        await page
          .getByRole(
            'button',
            {
              name:
                `Remover ${name} do carrinho`,
              exact: true,
            },
          )
          .click()

        await expect(
          page.getByRole(
            'heading',
            {
              level: 2,
              name:
                'Seu carrinho está vazio',
            },
          ),
        ).toBeVisible()

        await page.reload()

        await expect(
          page.getByRole(
            'heading',
            {
              level: 2,
              name:
                'Seu carrinho está vazio',
            },
          ),
        ).toBeVisible({
          timeout: 10_000,
        })
      },
    )

    test(
      'valida, aplica, persiste e remove cupom atualizando os totais',
      async ({
        page,
      }) => {
        await page.goto('/')

        await resetMockScenario(
          page,
        )

        await addNftToCart(
          page,
        )

        await page.goto(
          '/cart',
        )

        const couponInput =
          getCouponInput(
            page,
          )

        const applyButton =
          getApplyCouponButton(
            page,
          )

        await expect(
          couponInput,
        ).toBeVisible()

        const subtotalBefore =
          await getSummaryValue(
            page,
            'subtotal',
          )

        const networkFeeBefore =
          await getSummaryValue(
            page,
            'networkFee',
          )

        const totalBefore =
          await getSummaryValue(
            page,
            'total',
          )

        expect(
          subtotalBefore,
        ).toBeGreaterThan(0)

        expect(
          networkFeeBefore,
        ).toBeCloseTo(
          0.016,
          3,
        )

        expect(
          totalBefore,
        ).toBeGreaterThan(
          subtotalBefore,
        )

        /*
         * Cupom inválido.
         */
        await couponInput.fill(
          'CUPOM-INVALIDO',
        )

        await applyButton.click()

        await expect(
          page.getByRole(
            'alert',
          ),
        ).toHaveText(
          'Código promocional inválido.',
        )

        /*
         * Cupom válido.
         */
        await couponInput.fill(
          'kurio10',
        )

        await couponInput.press(
          'Enter',
        )

        await expect(
          page.getByRole(
            'button',
            {
              name:
                'Remover cupom KURIO10',
              exact: true,
            },
          ),
        ).toBeVisible()

        const discountAfter =
          await getSummaryValue(
            page,
            'discount',
          )

        const totalAfter =
          await getSummaryValue(
            page,
            'total',
          )

        expect(
          discountAfter,
        ).toBeGreaterThan(0)

        expect(
          totalAfter,
        ).toBeLessThan(
          totalBefore,
        )

        /*
         * Cupom aplicado deve
         * sobreviver ao refresh.
         */
        await page.reload()

        await expect(
          page.getByRole(
            'button',
            {
              name:
                'Remover cupom KURIO10',
              exact: true,
            },
          ),
        ).toBeVisible({
          timeout: 10_000,
        })

        const totalAfterReload =
          await getSummaryValue(
            page,
            'total',
          )

        expect(
          totalAfterReload,
        ).toBeCloseTo(
          totalAfter,
          3,
        )

        /*
         * Remove o cupom.
         */
        await page
          .getByRole(
            'button',
            {
              name:
                'Remover cupom KURIO10',
              exact: true,
            },
          )
          .click()

        await expect(
          getCouponInput(
            page,
          ),
        ).toBeVisible()

        const discountRemoved =
          await getSummaryValue(
            page,
            'discount',
          )

        const totalAfterRemoval =
          await getSummaryValue(
            page,
            'total',
          )

        expect(
          discountRemoved,
        ).toBe(0)

        expect(
          totalAfterRemoval,
        ).toBeCloseTo(
          totalBefore,
          3,
        )

        /*
         * Remoção também deve
         * sobreviver ao refresh.
         */
        await page.reload()

        await expect(
          getCouponInput(
            page,
          ),
        ).toBeVisible({
          timeout: 10_000,
        })

        await expect(
          page.getByRole(
            'button',
            {
              name:
                'Remover cupom KURIO10',
              exact: true,
            },
          ),
        ).toHaveCount(
          0,
        )
      },
    )
  },
)

test.afterEach(
  async ({
    page,
  }) => {
    await resetMockScenario(
      page,
    )
  },
)