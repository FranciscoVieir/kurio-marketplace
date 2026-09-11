import {
  expect,
  test,
  type Locator,
  type Page,
} from '@playwright/test'

import {
  updateNftRealtime,
} from './helpers/mock-realtime'

type CheckoutQuoteBody = {
  quoteId: string
  totalEth: string
  items: Array<{
    nftId: string
    quantity: number
    unitPriceEth: string
    availableQuantity: number
    version: number
  }>
}

type PreparedCheckout = {
  confirmButton: Locator
  nftId: string
  initialQuote: CheckoutQuoteBody
}

const DESKTOP_NFT_ID =
  'access-core-368'

const MOBILE_NFT_ID =
  'recursive-oracle-317'

const UPDATED_PRICE_ETH =
  '9.99'

const UPDATED_AVAILABLE_QUANTITY =
  2

function isCheckoutQuoteRequest(
  url: string,
  method: string,
) {
  return (
    new URL(url).pathname ===
      '/api/checkout/quote' &&
    method === 'POST'
  )
}

async function registerAndCreateWallet(
  page: Page,
) {
  const uniqueId =
    `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`

  const username =
    `realtime-${uniqueId}`

  const email =
    `realtime-${uniqueId}@kurio.test`

  const password =
    'Kurio123!'

  const walletAddress =
    '0x1234567890123456789012345678901234567890'

  const originalViewport =
    page.viewportSize()

  const isMobile =
    (originalViewport?.width ??
      1440) <= 767

  await page.goto('/')

  /*
   * O Header mobile não expõe o botão
   * Entrar no fluxo atual. Mantemos a
   * mesma estratégia dos testes de
   * checkout já estabilizados.
   */
  if (isMobile) {
    await page.setViewportSize({
      width: 1440,
      height: 900,
    })
  }

  const loginButton =
    page
      .getByRole('banner')
      .getByRole(
        'button',
        {
          name: 'Entrar',
          exact: true,
        },
      )

  await expect(
    loginButton,
  ).toBeVisible()

  await loginButton.click()

  const authDialog =
    page.getByRole(
      'dialog',
    )

  await expect(
    authDialog,
  ).toBeVisible()

  await authDialog
    .getByRole(
      'button',
      {
        name: 'Criar conta',
        exact: true,
      },
    )
    .click()

  const usernameInput =
    authDialog.locator(
      'input[autocomplete="username"]',
    )

  const emailInput =
    authDialog.locator(
      'input[autocomplete="email"]',
    )

  const passwordInputs =
    authDialog.locator(
      'input[autocomplete="new-password"]',
    )

  await expect(
    passwordInputs,
  ).toHaveCount(2)

  await usernameInput.fill(
    username,
  )

  await emailInput.fill(
    email,
  )

  await passwordInputs
    .first()
    .fill(password)

  await passwordInputs
    .nth(1)
    .fill(password)

  await authDialog
    .locator(
      'button[type="submit"]',
    )
    .click()

  await expect(
    authDialog,
  ).toBeHidden()

  if (
    isMobile &&
    originalViewport
  ) {
    await page.setViewportSize(
      originalViewport,
    )
  }

  /*
   * Os dois NFTs reservados para este
   * teste usam Ethereum, então criamos
   * uma carteira Ethereum compatível.
   */
  const walletResponse =
    await page.evaluate(
      async ({
        username,
        email,
        walletAddress,
      }) => {
        const response =
          await fetch(
            '/api/me/wallets',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  role: 'primary',
                  displayName:
                    'Realtime E2E Collector',
                  nickname:
                    username,
                  network:
                    'ethereum',
                  profileName:
                    'Realtime Collector',
                  address:
                    walletAddress,
                  provider:
                    'metamask',
                  email,
                }),
            },
          )

        return {
          ok: response.ok,
          status:
            response.status,
        }
      },
      {
        username,
        email,
        walletAddress,
      },
    )

  expect(
    walletResponse.ok,
    `Falha ao criar wallet. HTTP ${walletResponse.status}`,
  ).toBeTruthy()

  return {
    isMobile,
  }
}

async function prepareCheckout(
  page: Page,
): Promise<PreparedCheckout> {
  const {
    isMobile,
  } =
    await registerAndCreateWallet(
      page,
    )

  /*
   * Recursos diferentes por projeto
   * evitam que o broadcast global do
   * Socket.IO faça desktop e mobile
   * alterarem o mesmo NFT em paralelo.
   */
  const nftId =
    isMobile
      ? MOBILE_NFT_ID
      : DESKTOP_NFT_ID

  await page.goto(
    `/nft/${nftId}`,
  )

  await expect(
    page,
  ).toHaveURL(
    `/nft/${nftId}`,
  )

  const buyButton =
    page.getByRole(
      'button',
      {
        name:
          /^COMPRAR(?: NFT)?$/i,
      },
    )

  await expect(
    buyButton,
  ).toBeVisible({
    timeout: 10_000,
  })

  await buyButton.click()

  await expect(
    page
      .locator(
        '[role="status"]:visible',
      )
      .filter({
        hasText:
          /^Item adicionado ao carrinho\.$/,
      }),
  ).toBeVisible()

  await page.goto(
    '/cart',
  )

  await expect(
    page.getByText(
      '1 item no carrinho',
      {
        exact: true,
      },
    ),
  ).toBeVisible()

  const checkoutLink =
    page.getByRole(
      'link',
      {
        name:
          'Conectar e finalizar',
      },
    )

  await expect(
    checkoutLink,
  ).toBeVisible()

  const quoteResponsePromise =
    page.waitForResponse(
      (response) =>
        isCheckoutQuoteRequest(
          response.url(),
          response
            .request()
            .method(),
        ),
    )

  await checkoutLink.click()

  await expect(
    page,
  ).toHaveURL(
    '/checkout',
  )

  const quoteResponse =
    await quoteResponsePromise

  expect(
    quoteResponse.status(),
  ).toBe(201)

  const initialQuote =
    (await quoteResponse.json()) as CheckoutQuoteBody

  expect(
    initialQuote.items,
  ).toHaveLength(1)

  expect(
    initialQuote.items[0]?.nftId,
  ).toBe(
    nftId,
  )

  const checkoutHeading =
    page.getByRole(
      'heading',
      {
        level: 1,
        name: isMobile
          ? 'Pagamento com carteira'
          : 'Perfil do colecionador',
      },
    )

  await expect(
    checkoutHeading,
  ).toBeVisible({
    timeout: 15_000,
  })

  if (isMobile) {
    const primaryWallet =
      page.getByRole(
        'button',
        {
          name:
            /Principal.*Ethereum/i,
        },
      )

    await expect(
      primaryWallet,
    ).toBeVisible({
      timeout: 10_000,
    })

    await primaryWallet.click()
  } else {
    const walletAddressInput =
      page.getByLabel(
        'Endereço da carteira *',
      )

    await expect(
      walletAddressInput,
    ).toBeVisible({
      timeout: 10_000,
    })

    const connectButton =
      page.getByRole(
        'button',
        {
          name: 'Conectar',
          exact: true,
        },
      )

    await expect(
      connectButton,
    ).toBeVisible()

    await connectButton.click()

    await expect(
      page.getByText(
        'Conectada',
        {
          exact: true,
        },
      ),
    ).toBeVisible()
  }

  const confirmButton =
    page.getByRole(
      'button',
      {
        name:
          'Confirmar compra',
        exact: true,
      },
    )

  await expect(
    confirmButton,
  ).toBeEnabled({
    timeout: 10_000,
  })

  return {
    confirmButton,
    nftId,
    initialQuote,
  }
}

test(
  'revalida preço e disponibilidade recebidos via Socket.IO antes de confirmar a compra',
  async ({
    page,
  }) => {
    const {
      confirmButton,
      nftId,
      initialQuote,
    } =
      await prepareCheckout(
        page,
      )

    const initialItem =
      initialQuote.items[0]

    expect(
      initialItem,
    ).toBeTruthy()

    expect(
      initialItem?.unitPriceEth,
    ).not.toBe(
      UPDATED_PRICE_ETH,
    )

    expect(
      initialItem
        ?.availableQuantity,
    ).not.toBe(
      UPDATED_AVAILABLE_QUANTITY,
    )

    /*
     * O teste não altera React Query,
     * contexto ou localStorage direto.
     *
     * O endpoint mock persiste o novo
     * snapshot e publica nft.updated pelo
     * mesmo Socket.IO usado pela aplicação.
     */
    await updateNftRealtime(
      page,
      {
        nftId,
        priceEth:
          UPDATED_PRICE_ETH,
        availableQuantity:
          UPDATED_AVAILABLE_QUANTITY,
      },
    )

    const realtimeStatus =
      page
        .getByRole(
          'status',
        )
        .filter({
          hasText:
            'Preço ou disponibilidade atualizados',
        })

    await expect(
      realtimeStatus,
    ).toBeVisible({
      timeout: 10_000,
    })

    await expect(
      realtimeStatus,
    ).toContainText(
      `${UPDATED_PRICE_ETH} ETH`,
    )

    await expect(
      realtimeStatus,
    ).toContainText(
      `${UPDATED_AVAILABLE_QUANTITY} disponíveis`,
    )

    /*
     * Enquanto a quote representa o
     * snapshot anterior, a compra não
     * pode ser enviada.
     */
    await expect(
      confirmButton,
    ).toBeDisabled()

    const revalidateButton =
      page.getByRole(
        'button',
        {
          name:
            'Revalidar cotação',
          exact: true,
        },
      )

    await expect(
      revalidateButton,
    ).toBeEnabled()

    const refreshedQuotePromise =
      page.waitForResponse(
        (response) =>
          isCheckoutQuoteRequest(
            response.url(),
            response
              .request()
              .method(),
          ),
      )

    await revalidateButton.click()

    const refreshedQuoteResponse =
      await refreshedQuotePromise

    expect(
      refreshedQuoteResponse.status(),
    ).toBe(201)

    const refreshedQuote =
      (await refreshedQuoteResponse.json()) as CheckoutQuoteBody

    expect(
      refreshedQuote.quoteId,
    ).not.toBe(
      initialQuote.quoteId,
    )

    expect(
      refreshedQuote.totalEth,
    ).not.toBe(
      initialQuote.totalEth,
    )

    expect(
      refreshedQuote
        .items[0]
        ?.unitPriceEth,
    ).toBe(
      UPDATED_PRICE_ETH,
    )

    expect(
      refreshedQuote
        .items[0]
        ?.availableQuantity,
    ).toBe(
      UPDATED_AVAILABLE_QUANTITY,
    )

    expect(
      refreshedQuote
        .items[0]
        ?.version,
    ).toBeGreaterThan(
      initialItem?.version ??
        0,
    )

    /*
     * Depois da revalidação, o resumo
     * passa a refletir a nova quote e a
     * confirmação volta a ser permitida.
     */
    await expect(
      realtimeStatus,
    ).toBeHidden({
      timeout: 10_000,
    })

    await expect(
      page
        .getByText(
          `${refreshedQuote.totalEth} ETH`,
          {
            exact: true,
          },
        )
        .and(
          page.locator(
            ':visible',
          ),
        )
        .first(),
    ).toBeVisible()

    await expect(
      confirmButton,
    ).toBeEnabled({
      timeout: 10_000,
    })
  },
)
