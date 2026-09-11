import {
  expect,
  test,
  type Locator,
  type Page,
} from '@playwright/test'

import {
  resetMockScenario,
  setMockScenario,
} from './helpers/mock-scenario'

type PreparedCheckout = {
  confirmButton: Locator
  nftName: string
}

type TestNft = {
  id: string
  name: string
}

type TestNftByViewport = {
  desktop: TestNft
  mobile: TestNft
}

const PAYMENT_REFUSED_NFTS: TestNftByViewport = {
  desktop: {
    id: 'sage-nomad-009',
    name: 'Sage Nomad #009',
  },
  mobile: {
    id: 'neon-relic-031',
    name: 'Neon Relic #031',
  },
}

const PAYMENT_TIMEOUT_NFTS: TestNftByViewport = {
  desktop: {
    id: 'echo-frame-077',
    name: 'Echo Frame #077',
  },
  mobile: {
    id: 'arcade-prime-188',
    name: 'Arcade Prime #188',
  },
}

type OrderResponseBody = {
  id?: string
  status?: string
}

async function registerAndCreateWallet(
  page: Page,
) {
  const uniqueId =
    `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`

  const username =
    `payment-${uniqueId}`

  const email =
    `payment-${uniqueId}@kurio.test`

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
   * Mantém exatamente a estratégia
   * já usada pelo checkout.spec.ts:
   * no projeto atual o Header mobile
   * não expõe o botão Entrar.
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

  const createAccountButton =
    authDialog.getByRole(
      'button',
      {
        name: 'Criar conta',
        exact: true,
      },
    )

  await createAccountButton.click()

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
   * Wallet criada pela API mock,
   * como no fluxo E2E já estabilizado.
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
                    'Payment E2E Collector',
                  nickname:
                    username,
                  network:
                    'ethereum',
                  profileName:
                    'Payment Collector',
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
  nfts: TestNftByViewport,
): Promise<PreparedCheckout> {
  const {
    isMobile,
  } =
    await registerAndCreateWallet(
      page,
    )

  /*
   * Cada cenário/projeto usa um NFT
   * Ethereum próprio.
   *
   * Isso garante duas coisas:
   * 1. a carteira Ethereum criada pelo teste
   *    sempre é compatível com a quote;
   * 2. workers paralelos não alteram o mesmo
   *    estoque/versão entre si.
   *
   * Também usamos IDs explícitos em vez da
   * posição no catálogo para o teste não
   * depender de ordenação ou paginação.
   */
  const nft =
    isMobile
      ? nfts.mobile
      : nfts.desktop

  await page.goto(
    `/nft/${nft.id}`,
  )

  await expect(
    page,
  ).toHaveURL(
    `/nft/${nft.id}`,
  )

  const nftName =
    nft.name

  const nftTitle =
    page.locator(
      'h1:visible',
      {
        hasText:
          nftName,
      },
    )

  await expect(
    nftTitle.first(),
  ).toBeVisible({
    timeout: 10_000,
  })

  await page
    .getByRole(
      'button',
      {
        name:
          /^COMPRAR(?: NFT)?$/i,
      },
    )
    .click()

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

  /*
   * A quote é a condição real para a tela
   * de checkout sair do skeleton. Esperamos
   * a resposta da API em vez de depender
   * apenas de polling visual.
   */
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
    'A quote do checkout deveria ser criada com sucesso.',
  ).toBe(201)

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
    nftName,
  }
}

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

function getVisibleExactText(
  page: Page,
  text: string,
) {
  return page
    .getByText(
      text,
      {
        exact: true,
      },
    )
    .and(
      page.locator(
        ':visible',
      ),
    )
}

function isCreateOrderRequest(
  url: string,
  method: string,
) {
  return (
    new URL(url).pathname ===
      '/api/orders' &&
    method === 'POST'
  )
}

test.describe(
  'Falhas e idempotência do pagamento',
  () => {
    test(
      'pagamento recusado preserva carrinho e não cria pedido',
      async ({
        page,
      }) => {
        await page.goto('/')

        await resetMockScenario(
          page,
        )

        const {
          confirmButton,
          nftName,
        } =
          await prepareCheckout(
            page,
            PAYMENT_REFUSED_NFTS,
          )

        await setMockScenario(
          page,
          'payment-refused',
        )

        const responsePromise =
          page.waitForResponse(
            (response) =>
              isCreateOrderRequest(
                response.url(),
                response
                  .request()
                  .method(),
              ),
          )

        await confirmButton.click()

        const response =
          await responsePromise

        expect(
          response.status(),
        ).toBe(402)

        const body =
          (await response.json()) as {
            code?: string
          }

        expect(
          body.code,
        ).toBe(
          'PAYMENT_REFUSED',
        )

        await expect(
          page.getByRole(
            'alert',
          ),
        ).toContainText(
          'O pagamento foi recusado pela carteira.',
        )

        await expect(
          page,
        ).toHaveURL(
          '/checkout',
        )

        /*
         * Uma falha definitiva antes do
         * commit não deve criar pedido.
         */
        const orders =
          await page.evaluate(
            async () => {
              const result =
                await fetch(
                  '/api/me/orders',
                )

              return result.json()
            },
          )

        expect(
          Array.isArray(orders)
            ? orders
            : [],
        ).toHaveLength(0)

        /*
         * Como onSuccess não ocorreu,
         * clearCart() não deve ter sido
         * chamado.
         */
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

        await expect(
          page
            .getByRole(
              'link',
              {
                name:
                  nftName,
                exact: true,
              },
            )
            .first(),
        ).toBeVisible()
      },
    )

    test(
      'bloqueia clique repetido durante envio e recupera o mesmo pedido após timeout',
      async ({
        page,
      }) => {
        /*
         * O cenário usa um timeout real do Axios.
         * O mock segura a primeira resposta por 11s,
         * enquanto o cliente aborta após 10s.
         */
        test.setTimeout(
          45_000,
        )

        await page.goto('/')

        await resetMockScenario(
          page,
        )

        const {
          nftName,
        } =
          await prepareCheckout(
            page,
            PAYMENT_TIMEOUT_NFTS,
          )

        await setMockScenario(
          page,
          'payment-timeout',
        )

        const orderRequests: Array<{
          idempotencyKey: string
        }> = []

        page.on(
          'request',
          (request) => {
            if (
              !isCreateOrderRequest(
                request.url(),
                request.method(),
              )
            ) {
              return
            }

            orderRequests.push({
              idempotencyKey:
                request.headers()[
                  'idempotency-key'
                ] ?? '',
            })
          },
        )

        /*
         * Esperamos a REQUISIÇÃO, não uma resposta HTTP.
         * A primeira tentativa é abortada pelo timeout
         * do Axios antes de a resposta atrasada do MSW
         * chegar ao cliente.
         */
        const firstConfirmButton =
          page
            .locator(
              'button:visible',
            )
            .filter({
              hasText:
                /^Confirmar compra$/,
            })

        await expect(
          firstConfirmButton,
        ).toBeEnabled()

        const firstRequestPromise =
          page.waitForRequest(
            (request) =>
              isCreateOrderRequest(
                request.url(),
                request.method(),
              ),
          )

        await firstConfirmButton.click()

        const firstRequest =
          await firstRequestPromise

        const firstIdempotencyKey =
          firstRequest.headers()[
            'idempotency-key'
          ] ?? ''

        expect(
          firstIdempotencyKey,
        ).toBeTruthy()

        const pendingButton =
          page
            .locator(
              'button:visible',
            )
            .filter({
              hasText:
                /Confirmando compra/i,
            })

        await expect(
          pendingButton,
        ).toBeDisabled({
          timeout: 5_000,
        })

        /*
         * Enquanto a primeira mutation está pendente,
         * apenas uma criação de pedido pode existir.
         */
        expect(
          orderRequests,
        ).toHaveLength(1)

        /*
         * Depois de ~10s o Axios encerra a tentativa.
         * Não esperamos HTTP 504 porque o mock não envia
         * um 504: ele apenas atrasa a resposta por 11s.
         */
        await expect(
          page.locator(
            '[role="alert"]:visible',
          ),
        ).toContainText(
          'Não foi possível concluir a compra. Tente novamente.',
          {
            timeout: 15_000,
          },
        )

        await expect(
          page,
        ).toHaveURL(
          '/checkout',
        )

        /*
         * O backend já persistiu o pedido ANTES de
         * atrasar a resposta, portanto o pedido deve
         * existir mesmo após o timeout percebido pela UI.
         */
        const ordersAfterTimeout =
          await page.evaluate(
            async () => {
              const response =
                await fetch(
                  '/api/me/orders',
                )

              return response.json()
            },
          ) as Array<{
            id: string
            status: string
          }>

        expect(
          ordersAfterTimeout,
        ).toHaveLength(1)

        const originalOrderId =
          ordersAfterTimeout[0]?.id

        expect(
          originalOrderId,
        ).toBeTruthy()

        /*
         * O carrinho deve continuar disponível e a UI
         * precisa permitir uma tentativa manual de recuperação.
         */
        await expect(
          page.getByRole(
            'heading',
            {
              name:
                'Seu carrinho está vazio',
            },
          ),
        ).toHaveCount(0)

        const retryButton =
          page
            .locator(
              'button:visible',
            )
            .filter({
              hasText:
                /^Confirmar compra$/,
            })

        await expect(
          retryButton,
        ).toBeEnabled({
          timeout: 5_000,
        })

        /*
         * O retry reutiliza a mesma chave de idempotência.
         * Como o pedido já existe, o handler devolve o
         * mesmo recurso imediatamente com HTTP 200.
         */
        const secondResponsePromise =
          page.waitForResponse(
            (response) =>
              isCreateOrderRequest(
                response.url(),
                response
                  .request()
                  .method(),
              ) &&
              response.status() ===
                200,
          )

        await retryButton.click()

        const secondResponse =
          await secondResponsePromise

        const recoveredOrder =
          (await secondResponse.json()) as OrderResponseBody

        expect(
          recoveredOrder.id,
        ).toBe(
          originalOrderId,
        )

        await expect
          .poll(
            () =>
              orderRequests.length,
          )
          .toBe(2)

        expect(
          orderRequests[0]
            ?.idempotencyKey,
        ).toBe(
          firstIdempotencyKey,
        )

        expect(
          orderRequests[1]
            ?.idempotencyKey,
        ).toBe(
          firstIdempotencyKey,
        )

        await expect(
          page,
        ).toHaveURL(
          new RegExp(
            `/orders/${originalOrderId}$`,
          ),
          {
            timeout: 10_000,
          },
        )

        const ordersAfterRetry =
          await page.evaluate(
            async () => {
              const response =
                await fetch(
                  '/api/me/orders',
                )

              return response.json()
            },
          ) as Array<{
            id: string
          }>

        expect(
          ordersAfterRetry,
        ).toHaveLength(1)

        expect(
          ordersAfterRetry[0]?.id,
        ).toBe(
          originalOrderId,
        )

        await expect(
          page
            .getByText(
              /confirmado|confirmada/i,
            )
            .first(),
        ).toBeVisible({
          timeout: 10_000,
        })

        await expect(
          getVisibleExactText(
            page,
            nftName,
          ),
        ).toBeVisible()
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
