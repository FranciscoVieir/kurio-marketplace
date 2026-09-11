import {
  expect,
  test,
  type Locator,
  type Page,
} from '@playwright/test'
import {
  io,
} from 'socket.io-client'

import {
  updateNftRealtime,
} from '../e2e/helpers/mock-realtime'

type RealtimeNft = {
  id: string
  name: string
  priceEth: string
  availableQuantity: number
  version: number
  [key: string]: unknown
}

type RealtimeUpdateResponse = {
  nft: RealtimeNft
}

type OrderSnapshot = {
  id: string
  status: string
  version: number
}

type PreparedCheckout = {
  confirmButton: Locator
}

const DUPLICATE_EVENT_NFT = {
  desktop:
    'copper-ape-201',
  mobile:
    'scarlet-muse-239',
}

const RECOVERY_NFT = {
  desktop:
    'neon-frequency-278',
  mobile:
    'emerald-ape-042',
}

function isMobilePage(
  page: Page,
) {
  return (
    (page.viewportSize()
      ?.width ??
      1440) <= 767
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
    .first()
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

function isOrderDetailRequest(
  url: string,
  method: string,
  orderId: string,
) {
  return (
    new URL(url).pathname ===
      `/api/orders/${orderId}` &&
    method === 'GET'
  )
}

async function emitRawNftUpdated(
  page: Page,
  nft: RealtimeNft,
) {
  const origin =
    new URL(
      page.url(),
    ).origin

  const socket =
    io(
      origin,
      {
        path:
          '/socket.io/',
        transports: [
          'websocket',
        ],
        forceNew:
          true,
        reconnection:
          false,
      },
    )

  try {
    await new Promise<void>(
      (
        resolve,
        reject,
      ) => {
        const timeout =
          setTimeout(
            () => {
              reject(
                new Error(
                  'Timeout ao conectar publisher Socket.IO do teste.',
                ),
              )
            },
            5_000,
          )

        socket.once(
          'connect',
          () => {
            clearTimeout(
              timeout,
            )

            resolve()
          },
        )

        socket.once(
          'connect_error',
          (
            error,
          ) => {
            clearTimeout(
              timeout,
            )

            reject(
              error,
            )
          },
        )
      },
    )

    /*
     * O servidor de desenvolvimento
     * retransmite __mock.nft.updated
     * como nft.updated.
     *
     * Esperamos o próprio broadcast
     * voltar ao publisher para provar
     * que o evento realmente atravessou
     * o Socket.IO, evitando um teste que
     * passe apenas porque nada aconteceu.
     */
    await new Promise<void>(
      (
        resolve,
        reject,
      ) => {
        const timeout =
          setTimeout(
            () => {
              socket.off(
                'nft.updated',
                handleBroadcast,
              )

              reject(
                new Error(
                  'O broadcast nft.updated não foi recebido.',
                ),
              )
            },
            5_000,
          )

        function handleBroadcast(
          event: {
            nft?: {
              id?: string
              version?: number
            }
          },
        ) {
          if (
            event.nft
              ?.id !==
              nft.id ||
            event.nft
              ?.version !==
              nft.version
          ) {
            return
          }

          clearTimeout(
            timeout,
          )

          socket.off(
            'nft.updated',
            handleBroadcast,
          )

          resolve()
        }

        socket.on(
          'nft.updated',
          handleBroadcast,
        )

        socket.emit(
          '__mock.nft.updated',
          {
            nft,
          },
        )
      },
    )
  } finally {
    socket.disconnect()
  }
}

async function registerAndCreateWallet(
  page: Page,
) {
  const uniqueId =
    `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`

  const username =
    `reconnect-${uniqueId}`

  const email =
    `reconnect-${uniqueId}@kurio.test`

  const password =
    'Kurio123!'

  const walletAddress =
    '0x1234567890123456789012345678901234567890'

  const originalViewport =
    page.viewportSize()

  const isMobile =
    isMobilePage(
      page,
    )

  await page.goto('/')

  /*
   * Repete a estratégia dos fluxos
   * E2E já estabilizados: o Header
   * mobile atual não expõe Entrar.
   */
  if (isMobile) {
    await page.setViewportSize({
      width: 1440,
      height: 900,
    })
  }

  const loginButton =
    page
      .getByRole(
        'banner',
      )
      .getByRole(
        'button',
        {
          name:
            'Entrar',
          exact:
            true,
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
        name:
          'Criar conta',
        exact:
          true,
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
              method:
                'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  role:
                    'primary',
                  displayName:
                    'Reconnect E2E Collector',
                  nickname:
                    username,
                  network:
                    'ethereum',
                  profileName:
                    'Reconnect Collector',
                  address:
                    walletAddress,
                  provider:
                    'metamask',
                  email,
                }),
            },
          )

        return {
          ok:
            response.ok,
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
}

async function prepareCheckout(
  page: Page,
  nftId: string,
): Promise<PreparedCheckout> {
  await registerAndCreateWallet(
    page,
  )

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
    timeout:
      10_000,
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
        exact:
          true,
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
      (
        response,
      ) =>
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

  const isMobile =
    isMobilePage(
      page,
    )

  await expect(
    page.getByRole(
      'heading',
      {
        level: 1,
        name:
          isMobile
            ? 'Pagamento com carteira'
            : 'Perfil do colecionador',
      },
    ),
  ).toBeVisible({
    timeout:
      15_000,
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
      timeout:
        10_000,
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
      timeout:
        10_000,
    })

    const connectButton =
      page.getByRole(
        'button',
        {
          name:
            'Conectar',
          exact:
            true,
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
          exact:
            true,
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
        exact:
          true,
      },
    )

  await expect(
    confirmButton,
  ).toBeEnabled({
    timeout:
      10_000,
  })

  return {
    confirmButton,
  }
}

async function readStoredOrder(
  page: Page,
  orderId: string,
) {
  return page.evaluate(
    (
      currentOrderId,
    ) => {
      const raw =
        window.localStorage.getItem(
          'kurio:mock:orders',
        )

      if (!raw) {
        return null
      }

      const entries =
        JSON.parse(
          raw,
        ) as Array<
          [
            string,
            {
              id: string
              status: string
              version: number
            },
          ]
        >

      return (
        entries.find(
          ([
            storedOrderId,
          ]) =>
            storedOrderId ===
            currentOrderId,
        )?.[1] ??
        null
      )
    },
    orderId,
  )
}

test.describe(
  'Realtime resiliente',
  () => {
    test(
      'ignora nft.updated duplicado e antigo sem regredir preço ou disponibilidade',
      async ({
        page,
      }) => {
        const nftId =
          isMobilePage(
            page,
          )
            ? DUPLICATE_EVENT_NFT.mobile
            : DUPLICATE_EVENT_NFT.desktop

        await page.goto(
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
        ).toBeEnabled({
          timeout:
            10_000,
        })

        /*
         * Primeiro criamos uma atualização
         * legítima: persiste na REST e viaja
         * pelo Socket.IO real.
         */
        const result =
          (await updateNftRealtime(
            page,
            {
              nftId,
              priceEth:
                '8.88',
              availableQuantity:
                3,
            },
          )) as RealtimeUpdateResponse

        const currentNft =
          result.nft

        expect(
          currentNft.version,
        ).toBeGreaterThan(1)

        await expect(
          getVisibleExactText(
            page,
            '8.88 ETH',
          ),
        ).toBeVisible({
          timeout:
            10_000,
        })

        await expect(
          buyButton,
        ).toBeEnabled()

        /*
         * Mesmo recurso + mesma versão,
         * porém com dados conflitantes.
         * É uma duplicata e deve ser
         * completamente descartada.
         */
        await emitRawNftUpdated(
          page,
          {
            ...currentNft,
            priceEth:
              '0.01',
            availableQuantity:
              0,
          },
        )

        await expect(
          getVisibleExactText(
            page,
            '8.88 ETH',
          ),
        ).toBeVisible()

        await expect(
          getVisibleExactText(
            page,
            '0.01 ETH',
          ),
        ).toHaveCount(0)

        await expect(
          buyButton,
        ).toBeEnabled()

        /*
         * Agora enviamos uma versão menor.
         * Mesmo trazendo preço/estoque
         * diferentes, ela não pode regredir
         * o snapshot mais recente.
         */
        await emitRawNftUpdated(
          page,
          {
            ...currentNft,
            priceEth:
              '0.02',
            availableQuantity:
              0,
            version:
              currentNft.version -
              1,
          },
        )

        await expect(
          getVisibleExactText(
            page,
            '8.88 ETH',
          ),
        ).toBeVisible()

        await expect(
          getVisibleExactText(
            page,
            '0.02 ETH',
          ),
        ).toHaveCount(0)

        await expect(
          buyButton,
        ).toBeEnabled()
      },
    )

    test(
      'recupera o mesmo pedido após interrupção enquanto pending sem criar nova compra',
      async ({
        page,
        context,
      }) => {
        const nftId =
          isMobilePage(
            page,
          )
            ? RECOVERY_NFT.mobile
            : RECOVERY_NFT.desktop

        const {
          confirmButton,
        } =
          await prepareCheckout(
            page,
            nftId,
          )

        const orderRequests: string[] =
          []

        page.on(
          'request',
          (
            request,
          ) => {
            if (
              !isCreateOrderRequest(
                request.url(),
                request.method(),
              )
            ) {
              return
            }

            orderRequests.push(
              request.headers()[
                'idempotency-key'
              ] ?? '',
            )
          },
        )

        const createOrderResponsePromise =
          page.waitForResponse(
            (
              response,
            ) =>
              isCreateOrderRequest(
                response.url(),
                response
                  .request()
                  .method(),
              ),
          )

        await confirmButton.click()

        const createOrderResponse =
          await createOrderResponsePromise

        expect(
          createOrderResponse.status(),
        ).toBe(201)

        const createdOrder =
          (await createOrderResponse.json()) as OrderSnapshot

        expect(
          createdOrder.id,
        ).toBeTruthy()

        expect(
          createdOrder.status,
        ).toBe(
          'pending',
        )

        expect(
          createdOrder.version,
        ).toBe(1)

        await expect(
          page,
        ).toHaveURL(
          new RegExp(
            `/orders/${createdOrder.id}$`,
          ),
          {
            timeout:
              10_000,
          },
        )

        const pendingButton =
          page.getByRole(
            'button',
            {
              name:
                'Aguardando confirmação',
              exact:
                true,
            },
          )

        await expect(
          pendingButton,
        ).toBeVisible({
          timeout:
            5_000,
        })

        /*
         * Neste momento existe exatamente
         * uma compra e o pedido ainda está
         * pending. Cortamos a rede antes da
         * confirmação assíncrona.
         */
        expect(
          orderRequests,
        ).toHaveLength(1)

        expect(
          orderRequests[0],
        ).toBeTruthy()

        let browserOffline =
          false

        try {
          await context.setOffline(
            true,
          )

          browserOffline =
            true

          /*
           * A confirmação do mock acontece
           * em 1800 ms. Esperamos além desse
           * intervalo com o navegador offline.
           */
          await new Promise<void>(
            (
              resolve,
            ) => {
              setTimeout(
                resolve,
                2_400,
              )
            },
          )

          /*
           * O backend mock já persistiu o
           * estado terminal, mesmo que a tela
           * não tenha recebido order.updated.
           */
          const storedWhileOffline =
            await readStoredOrder(
              page,
              createdOrder.id,
            )

          expect(
            storedWhileOffline
              ?.status,
          ).toBe(
            'confirmed',
          )

          expect(
            storedWhileOffline
              ?.version,
          ).toBeGreaterThan(
            createdOrder.version,
          )

          /*
           * Sem rede, a UI continua com o
           * snapshot pending que já possuía.
           */
          await expect(
            pendingButton,
          ).toBeVisible()

          /*
           * Preparamos a observação antes
           * de restaurar a rede. Ao conectar
           * novamente, RealtimeProvider
           * invalida ['orders', ...] e a
           * query ativa deve reconciliar
           * via REST.
           */
          const reconciliationRequest =
            page.waitForRequest(
              (
                request,
              ) =>
                isOrderDetailRequest(
                  request.url(),
                  request.method(),
                  createdOrder.id,
                ),
              {
                timeout:
                  10_000,
              },
            )

          await context.setOffline(
            false,
          )

          browserOffline =
            false

          await reconciliationRequest

          await expect(
            getVisibleExactText(
              page,
              'Processamento concluído.',
            ),
          ).toBeVisible({
            timeout:
              10_000,
          })

          await expect(
            page.getByRole(
              'button',
              {
                name:
                  'Ver no Etherscan',
                exact:
                  true,
              },
            ),
          ).toBeVisible()

          /*
           * A reconciliação é leitura.
           * Nenhum segundo POST /orders
           * pode ocorrer.
           */
          expect(
            orderRequests,
          ).toHaveLength(1)

          const orders =
            await page.evaluate(
              async () => {
                const response =
                  await fetch(
                    '/api/me/orders',
                  )

                return response.json()
              },
            ) as OrderSnapshot[]

          expect(
            orders,
          ).toHaveLength(1)

          expect(
            orders[0]?.id,
          ).toBe(
            createdOrder.id,
          )

          expect(
            orders[0]?.status,
          ).toBe(
            'confirmed',
          )

          expect(
            orders[0]?.version,
          ).toBeGreaterThan(
            createdOrder.version,
          )

          /*
           * Refresh também deve recuperar o
           * mesmo recurso terminal, sem nova
           * tentativa de compra.
           */
          await page.reload()

          await expect(
            page,
          ).toHaveURL(
            new RegExp(
              `/orders/${createdOrder.id}$`,
            ),
          )

          await expect(
            getVisibleExactText(
              page,
              'Processamento concluído.',
            ),
          ).toBeVisible({
            timeout:
              10_000,
          })

          expect(
            orderRequests,
          ).toHaveLength(1)
        } finally {
          if (
            browserOffline
          ) {
            await context.setOffline(
              false,
            )
          }
        }
      },
    )
  },
)
