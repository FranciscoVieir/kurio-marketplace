import {
  expect,
  test,
} from '@playwright/test'

import {
  resetMockScenario,
  setMockScenario,
} from './helpers/mock-scenario'

test(
  'impede a compra quando o estoque muda após a cotação',
  async ({ page }) => {
    const uniqueId =
      Date.now().toString()

    const username =
      `stock-${uniqueId}`

    const email =
      `stock-${uniqueId}@kurio.test`

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
     * 1. Sempre inicia
     * no cenário padrão.
     */
    await resetMockScenario(
      page,
    )

    /*
     * 2. Cria e autentica
     * uma conta real.
     *
     * O Header mobile não expõe
     * o mesmo botão Entrar.
     *
     * Como esse teste verifica
     * revalidação de estoque,
     * usamos temporariamente
     * o Header desktop apenas
     * durante a autenticação.
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
     * após terminar a autenticação.
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
     * cadastrada via MSW.
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
                      'Stock E2E Collector',

                    nickname:
                      username,

                    network:
                      'ethereum',

                    profileName:
                      'Stock Validation',

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
          hasText:
            nftName,
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
     * Navegação direta para evitar
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
     * 6. Entra no checkout ainda
     * com cenário padrão.
     *
     * Precisamos primeiro criar
     * uma quote completamente válida.
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
     * 7. Aguarda a quote e detecta
     * qual layout está realmente
     * visível.
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
     * Neste ponto a quote inicial
     * já foi criada no cenário padrão.
     *
     * Agora garantimos que a carteira
     * esteja selecionada/conectada
     * ANTES de mudar o estoque.
     */
    if (isMobileCheckout) {
      /*
       * MOBILE
       *
       * A carteira principal deve
       * estar presente na tela.
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
       * Selecionar uma carteira no
       * fluxo mobile também define
       * o estado como connected.
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

      /*
       * Confirma que chegamos a um
       * estado em que a compra poderia
       * ser executada normalmente.
       */
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
       *
       * A carteira primária deve ter
       * preenchido automaticamente
       * o formulário.
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
       * Verifica provider e rede
       * sem assumir um <select>
       * nativo.
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
       * é explicitamente manual.
       */
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
     * 8. SOMENTE AGORA alteramos
     * deterministicamente o estoque.
     *
     * A quote existente representa
     * o estado anterior do NFT.
     *
     * Portanto o POST /api/orders
     * deverá revalidar a disponibilidade
     * contra o novo estado.
     */
    await setMockScenario(
      page,
      'insufficient-stock',
    )

    /*
     * 9. Tenta concluir a compra
     * utilizando a quote anterior.
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
     * 10. O backend precisa detectar
     * a mudança de estoque.
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
      'A quantidade disponível de um dos NFTs foi alterada antes da confirmação da compra.',
    )

    /*
     * 11. A compra rejeitada
     * não pode produzir pedido
     * confirmado nem sair do checkout.
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