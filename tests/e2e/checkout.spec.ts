import {
  expect,
  test,
} from '@playwright/test'

test(
  'conclui uma compra do catálogo até a confirmação do pedido',
  async ({ page }) => {
    const uniqueId =
      `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`

    const username =
      `playwright-${uniqueId}`

    const email =
      `playwright-${uniqueId}@kurio.test`

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
     * 1. Cria uma conta real
     * utilizando a interface.
     *
     * O Header mobile não possui
     * o mesmo botão Entrar do desktop.
     * Como autenticação responsiva será
     * testada separadamente, abrimos
     * temporariamente o Header desktop.
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

    /*
     * Confirma que o formulário
     * realmente mudou para cadastro.
     */
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

    /*
     * O cadastro também
     * autentica o usuário.
     */
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
     * 2. Cria uma carteira pela
     * API mock.
     *
     * O fetch ocorre dentro do browser,
     * portanto continua passando pelo MSW.
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
                      'Playwright Collector',

                    nickname:
                      username,

                    network:
                      'ethereum',

                    profileName:
                      'E2E Collector',

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
     * 3. Volta ao catálogo
     * e abre um NFT isolado por projeto.
     *
     * Desktop e mobile rodam em paralelo.
     * Se ambos comprarem o mesmo NFT, o
     * commit de um worker altera versão e
     * estoque enquanto o outro ainda está
     * criando a cotação.
     */
    await page.goto('/')

    const nftIndex =
      isMobile ? 1 : 0

    const nftLink =
      page
        .locator(
          '#catalog article',
        )
        .nth(nftIndex)
        .locator(
          'a[href^="/nft/"]',
        )
        .first()

    await expect(
      nftLink,
    ).toBeVisible()

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
    ).toBeVisible()

    /*
     * 4. Adiciona o NFT
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
            name:
              nftName,

            exact:
              true,
          },
        )
        .first(),
    ).toBeVisible()

    /*
     * 5. Avança para checkout.
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
     * 6. Aguarda a quote e
     * identifica o layout correto.
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
          .catch(() => false)
      ) ||
      (
        await desktopCheckoutHeading
          .isVisible()
          .catch(() => false)
      ),
    {
      timeout: 10_000,
    },
  )
  .toBe(true)

const isMobileCheckout =
  await mobileCheckoutHeading
    .isVisible()
    .catch(() => false)

    /*
     * 7. Valida seleção e
     * conexão da carteira.
     *
     * MOBILE
     */
    if (isMobile) {
      /*
       * A carteira principal
       * cadastrada deve aparecer.
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
       * Clica explicitamente para
       * garantir selectedWallet
       * e status connected.
       */
      await primaryWallet.click()

      /*
       * MetaMask deve ser o provider
       * da carteira cadastrada.
       */
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
       * O botão principal deve estar
       * disponível após a carteira
       * ter sido selecionada.
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

      /*
       * 8. Finaliza a compra.
       */
      await confirmButton.click()
    } else {
      /*
       * DESKTOP
       *
       * O formulário deve ter sido
       * preenchido automaticamente
       * com a carteira principal.
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
          timeout:
            10_000,
        },
      )

      /*
       * O componente da carteira
       * mostra provider + rede.
       *
       * Não usamos toHaveValue()
       * na Rede porque ela utiliza
       * componente customizado.
       */
      await expect(
        page.getByText(
          'MetaMask · Ethereum',
          {
            exact:
              true,
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

      /*
       * 8. Confirma compra.
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
      ).toBeEnabled()

      await confirmButton.click()
    }

    /*
     * 9. A criação do pedido
     * deve navegar para o recibo.
     */
    await expect(
      page,
    ).toHaveURL(
      /\/orders\/[^/]+$/,
      {
        timeout:
          10_000,
      },
    )

    /*
     * 10. O pedido deve chegar
     * ao estado confirmado.
     *
     * Esse estado é atualizado
     * pelo fluxo realtime.
     */
    await expect(
      page
        .getByText(
          /confirmado|confirmada/i,
        )
        .first(),
    ).toBeVisible({
      timeout:
        10_000,
    })

    /*
     * 11. O recibo preserva
     * o NFT comprado.
     */
    await expect(
      page
        .getByText(
          nftName,
          {
            exact:
              true,
          },
        )
        .first(),
    ).toBeVisible()
  },
)