import {
  expect,
  test,
} from '@playwright/test'

import {
  resetMockScenario,
  setMockScenario,
} from './helpers/mock-scenario'

test(
  'impede a compra quando o NFT muda após a cotação',
  async ({ page }) => {
    const uniqueId =
      Date.now().toString()

    const username =
      `version-${uniqueId}`

    const email =
      `version-${uniqueId}@kurio.test`

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
      page.getByRole('dialog')

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
     * Restaura o viewport mobile
     * depois da autenticação.
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
                      'Version E2E Collector',

                    nickname:
                      username,

                    network:
                      'ethereum',

                    profileName:
                      'Version Validation',

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
     * 4. Abre o primeiro NFT.
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
     * 6. Entra no checkout
     * enquanto o NFT ainda
     * está na versão original.
     *
     * A quote precisa existir
     * antes da mudança.
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
     * 7. Aguarda a quote
     * e identifica o layout
     * realmente visível.
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
     * 8. Garante que a carteira
     * esteja pronta antes da
     * alteração de versão do NFT.
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
       * No mobile selecionar
       * a carteira também define
       * a conexão como ativa.
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
       * é explícita.
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
     * 9. SOMENTE AGORA alteramos
     * deterministicamente a versão
     * do NFT.
     *
     * A quote permanece vinculada
     * à versão anterior.
     */
    await setMockScenario(
      page,
      'nft-version-changed',
    )

    /*
     * 10. Tenta concluir
     * utilizando a quote antiga.
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
     * 11. A revalidação deve
     * perceber que a versão
     * atual do NFT é diferente
     * da registrada na quote.
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
      'Um dos NFTs foi atualizado após a criação da cotação.',
    )

    /*
     * 12. O conflito de versão
     * não pode gerar um pedido.
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