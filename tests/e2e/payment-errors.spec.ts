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
  baseNftIndex: number,
): Promise<PreparedCheckout> {
  const {
    isMobile,
  } =
    await registerAndCreateWallet(
      page,
    )

  await page.goto('/')

  /*
   * Cada combinação cenário/projeto usa
   * um NFT diferente. Isso evita que um
   * teste que efetivamente faz commit de
   * estoque altere a versão do NFT usado
   * por outro worker em paralelo.
   *
   * base 0:
   *   desktop -> NFT 0
   *   mobile  -> NFT 1
   *
   * base 2:
   *   desktop -> NFT 2
   *   mobile  -> NFT 3
   */
  const nftIndex =
    baseNftIndex +
    (isMobile ? 1 : 0)

  const nftLink =
    page
      .locator(
        '#catalog article a[href^="/nft/"]',
      )
      .nth(
        nftIndex,
      )

  await expect(
    nftLink,
  ).toBeVisible({
    timeout: 10_000,
  })

  const nftName =
    (
      await nftLink
        .locator('h3')
        .innerText()
    ).trim()

  await nftLink.click()

  await expect(
    page,
  ).toHaveURL(
    /\/nft\/.+/,
  )

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
            0,
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
          page.locator(
            '[role="alert"]:visible',
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
         * Este fluxo espera o timeout real
         * de 10s configurado no Axios.
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
            0,
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
         * Usamos o botão visível do layout
         * atual. Desktop e mobile possuem
         * versões responsivas diferentes.
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

        /*
         * Enquanto a mutation está pendente,
         * a UI precisa bloquear uma segunda
         * submissão.
         */
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
         * Mesmo durante a espera do backend,
         * apenas uma criação de pedido deve
         * ter sido disparada.
         */
        expect(
          orderRequests,
        ).toHaveLength(1)

        /*
         * O handler do cenário segura a
         * resposta por mais de 10s.
         *
         * Portanto quem encerra a primeira
         * tentativa é o timeout real do Axios,
         * e não uma resposta HTTP 504.
         */
        await expect(
          page.getByRole(
            'alert',
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
         * Apesar do timeout no cliente, o
         * backend já persistiu o pedido antes
         * de atrasar a resposta.
         *
         * Consultamos a API para descobrir o
         * ID criado na primeira tentativa.
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
         * O onError não chama clearCart().
         * Se tivesse limpado o carrinho, o
         * checkout não voltaria a oferecer
         * "Confirmar compra".
         */
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

        /*
         * As duas tentativas precisam usar
         * exatamente a mesma chave.
         */
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

        /*
         * A segunda tentativa recupera o
         * mesmo recurso já criado antes do
         * timeout. Nenhum segundo pedido pode
         * existir.
         */
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

        /*
         * O pedido criado antes do timeout
         * continua seguindo o mesmo fluxo de
         * confirmação por realtime.
         *
         * Como o timeout do Axios é maior que
         * o delay de confirmação do mock, ele
         * normalmente já estará confirmado
         * quando a recuperação acontecer.
         */
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
