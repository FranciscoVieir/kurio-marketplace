import {
  expect,
  test,
} from '@playwright/test'

import {
  resetMockScenario,
  setMockScenario,
} from './helpers/mock-scenario'

test(
  'impede a compra quando a cotação está expirada',
  async ({ page }) => {
    const uniqueId =
      Date.now().toString()

    const username =
      `quote-expired-${uniqueId}`

    const email =
      `quote-expired-${uniqueId}@kurio.test`

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
     * 1. Sempre começa
     * no cenário padrão.
     */
    await resetMockScenario(
      page,
    )

    /*
     * 2. Cria e autentica
     * uma conta real.
     */
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

    /*
     * O Header mobile atual
     * não possui o mesmo botão
     * Entrar do desktop.
     *
     * Como este teste valida
     * expiração de quote,
     * usamos temporariamente
     * o Header desktop apenas
     * durante a autenticação.
     */
    if (isMobile) {
      await page.setViewportSize({
        width: 1440,
        height: 900,
      })
    }

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

    await expect(
      createAccountButton,
    ).toBeVisible()

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
      usernameInput,
    ).toBeVisible()

    await expect(
      emailInput,
    ).toBeVisible()

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

    const registerButton =
      authDialog.locator(
        'button[type="submit"]',
      )

    await expect(
      registerButton,
    ).toBeEnabled()

    await registerButton.click()

    await expect(
      authDialog,
    ).toBeHidden()

    /*
     * Restaura viewport mobile
     * após terminar o cadastro.
     */
    if (
      isMobile &&
      originalViewport
    ) {
      await page.setViewportSize(
        originalViewport,
      )
    }

    /*
     * 3. Cria uma carteira
     * cadastrada via API mock.
     *
     * O fetch roda no browser,
     * portanto passa pelo MSW.
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
                    role:
                      'primary',

                    displayName:
                      'Expired Quote Collector',

                    nickname:
                      username,

                    network:
                      'ethereum',

                    profileName:
                      'Expired Quote E2E',

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

    /*
     * 4. Volta ao catálogo
     * e abre o primeiro NFT.
     */
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
      (
        await firstNftLink
          .locator('h3')
          .innerText()
      ).trim()

    await firstNftLink.click()

    await expect(
      page,
    ).toHaveURL(
      /\/nft\/.+/,
    )

    const visibleNftTitle =
      page.locator(
        'h1:visible',
        {
          hasText: nftName,
        },
      )

    await expect(
      visibleNftTitle.first(),
    ).toBeVisible()

    /*
     * 5. Adiciona uma unidade
     * ao carrinho.
     */
    await page
      .getByRole(
        'button',
        {
          name: 'COMPRAR',
        },
      )
      .click()

    await expect(
      page.getByRole(
        'status',
      ),
    ).toHaveText(
      'Item adicionado ao carrinho.',
    )

    /*
     * Navegação direta evita
     * dependência do Header.
     */
    await page.goto('/cart')

    await expect(
      page,
    ).toHaveURL(
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
            name: nftName,
            exact: true,
          },
        )
        .first(),
    ).toBeVisible()

    /*
     * 6. DIFERENÇA DESTE CENÁRIO:
     *
     * Ativamos quote-expired
     * ANTES de entrar no checkout.
     *
     * Assim a cotação criada pelo
     * checkout já nasce expirada.
     */
    await setMockScenario(
      page,
      'quote-expired',
    )

    /*
     * 7. Entra no checkout.
     */
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

    await checkoutLink.click()

    await expect(
      page,
    ).toHaveURL(
      '/checkout',
    )

    /*
     * 8. Aguarda a criação
     * da quote e detecta
     * o layout realmente visível.
     */
    const mobileCheckoutHeading =
      page.getByRole(
        'heading',
        {
          level: 1,
          name:
            'Pagamento com carteira',
        },
      )

    const desktopCheckoutHeading =
      page.getByRole(
        'heading',
        {
          level: 1,
          name:
            'Perfil do colecionador',
        },
      )

    await expect
      .poll(
        async () =>
          (
            await mobileCheckoutHeading
              .isVisible()
              .catch(
                () => false,
              )
          ) ||
          (
            await desktopCheckoutHeading
              .isVisible()
              .catch(
                () => false,
              )
          ),
        {
          timeout: 10_000,
        },
      )
      .toBe(true)

    const isMobileCheckout =
      await mobileCheckoutHeading
        .isVisible()
        .catch(
          () => false,
        )

    /*
     * A quote expirada ainda deve
     * carregar os dados da compra.
     *
     * A rejeição ocorre somente
     * quando tentamos criar o pedido.
     */
    if (!isMobileCheckout) {
      await expect(
        page
          .getByText(
            nftName,
            {
              exact: true,
            },
          )
          .first(),
      ).toBeVisible()
    }

    /*
     * 9. Garante que a carteira
     * esteja selecionada/conectada.
     */
    if (isMobileCheckout) {
      /*
       * MOBILE
       */
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

      /*
       * No fluxo mobile,
       * selecionar a carteira
       * também define conexão.
       */
      await primaryWallet.click()

      const metamaskButton =
        page.getByRole(
          'button',
          {
            name:
              /MetaMask/i,
          },
        )

      await expect(
        metamaskButton,
      ).toBeVisible()

      const confirmButton =
        page.getByRole(
          'button',
          {
            name:
              'Confirmar compra',
          },
        )

      await expect(
        confirmButton,
      ).toBeEnabled({
        timeout: 10_000,
      })
    } else {
      /*
       * DESKTOP
       */
      const walletAddressInput =
        page.getByLabel(
          'Endereço da carteira *',
        )

      await expect(
        walletAddressInput,
      ).toBeVisible()

      await expect(
        walletAddressInput,
      ).toHaveValue(
        walletAddress,
        {
          timeout: 10_000,
        },
      )

      /*
       * A UI atual usa componentes
       * customizados para carteira
       * e rede, não <select> nativo.
       */
      await expect(
        page.getByText(
          'MetaMask · Ethereum',
          {
            exact: true,
          },
        ),
      ).toBeVisible({
        timeout: 10_000,
      })

      /*
       * No desktop a conexão
       * é manual.
       */
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

      const confirmButton =
        page.getByRole(
          'button',
          {
            name:
              'Confirmar compra',
          },
        )

      await expect(
        confirmButton,
      ).toBeEnabled()
    }

    /*
     * 10. Tenta finalizar
     * utilizando a quote que
     * já está expirada.
     */
    const confirmPurchaseButton =
      page.getByRole(
        'button',
        {
          name:
            'Confirmar compra',
        },
      )

    await expect(
      confirmPurchaseButton,
    ).toBeEnabled()

    await confirmPurchaseButton.click()

    /*
     * 11. O backend precisa
     * rejeitar a quote expirada.
     */
    const purchaseError =
      page.getByRole(
        'alert',
      )

    await expect(
      purchaseError,
    ).toBeVisible({
      timeout: 10_000,
    })

    await expect(
      purchaseError,
    ).toContainText(
      'A cotação expirou. Gere uma nova cotação antes de finalizar a compra.',
    )

    /*
     * 12. Uma quote expirada
     * não pode gerar pedido
     * nem navegar para recibo.
     */
    await expect(
      page,
    ).toHaveURL(
      '/checkout',
    )

    await expect(
      page,
    ).not.toHaveURL(
      /\/orders\/[^/]+$/,
    )
  },
)

test.afterEach(
  async ({ page }) => {
    await resetMockScenario(
      page,
    )
  },
)