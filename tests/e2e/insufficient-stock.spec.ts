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

    await page.goto('/')

    // 1. Começa sempre no cenário padrão.

    await resetMockScenario(
      page,
    )

    // 2. Cria e autentica uma conta real.

    await page
      .getByRole('button', {
        name: 'Entrar',
      })
      .click()

    const authDialog =
      page.getByRole('dialog')

    await expect(
      authDialog,
    ).toBeVisible()

    await authDialog
      .getByRole('button', {
        name: 'Criar conta',
        exact: true,
      })
      .click()

    await authDialog
      .getByLabel(
        'Nome de usuário',
      )
      .fill(username)

    await authDialog
      .getByLabel('E-mail')
      .fill(email)

    await authDialog
      .locator(
        'input[autocomplete="new-password"]',
      )
      .first()
      .fill(password)

    await authDialog
      .locator(
        'input[autocomplete="new-password"]',
      )
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

    await expect(
      page
        .getByRole('banner')
        .getByRole('link', {
          name: 'Meu perfil',
        }),
    ).toBeVisible()

    // 3. Cria uma wallet cadastrada
    // dentro do browser para a requisição
    // passar pelo MSW.

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

                body: JSON.stringify({
                  role: 'primary',

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

    // 4. Abre o primeiro NFT disponível.

    const firstNftLink =
      page
        .locator(
          '#catalog article a',
        )
        .first()

    await expect(
      firstNftLink,
    ).toBeVisible()

    const nftName = (
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

    await expect(
      page.getByRole(
        'heading',
        {
          level: 1,
          name: nftName,
        },
      ),
    ).toBeVisible()

    // 5. Adiciona uma unidade ao carrinho.

    await page
      .getByRole('button', {
        name: 'COMPRAR',
      })
      .click()

    await expect(
      page.getByRole('status'),
    ).toHaveText(
      'Item adicionado ao carrinho.',
    )

    await page
      .getByRole('link', {
        name:
          'Carrinho com 1 item',
      })
      .click()

    await expect(
      page,
    ).toHaveURL('/cart')

    await expect(
      page.getByText(
        '1 item no carrinho',
        {
          exact: true,
        },
      ),
    ).toBeVisible()

    // 6. Entra no checkout ainda
    // com o cenário padrão.
    //
    // Queremos primeiro uma quote
    // completamente válida.

    await page
      .getByRole('link', {
        name:
          'Conectar e finalizar',
      })
      .click()

    await expect(
      page,
    ).toHaveURL('/checkout')

    await expect(
      page.getByRole(
        'heading',
        {
          level: 1,
          name:
            'Perfil do colecionador',
        },
      ),
    ).toBeVisible()

    // A existência da tela com os dados
    // da quote prova que a cotação inicial
    // foi criada com sucesso.

    await expect(
      page.getByText(
        nftName,
        {
          exact: true,
        },
      ),
    ).toBeVisible()

    // 7. Confirma que a wallet cadastrada
    // foi carregada automaticamente.

    const walletSelect =
      page.locator('select').filter({
        has: page.locator(
          'option',
          {
            hasText:
              username,
          },
        ),
      })

    await expect(
      walletSelect,
    ).toBeVisible()

    await expect(
      walletSelect,
    ).not.toHaveValue('')

    await expect(
      page.getByLabel(
        'Endereço da carteira *',
      ),
    ).toHaveValue(
      walletAddress,
    )

    // 8. Simula a conexão da wallet.

    await page
      .getByRole('button', {
        name:
          'Conectar carteira',
      })
      .click()

    await expect(
      page.getByText(
        'Conectada',
        {
          exact: true,
        },
      ),
    ).toBeVisible()

    await expect(
      page.getByLabel('Rede *'),
    ).not.toHaveValue('')

    /*
     * 9. Somente AGORA alteramos
     * deterministicamente o estoque.
     *
     * A quote já existe e representa
     * o estado anterior do NFT.
     *
     * Durante POST /api/orders,
     * applyPurchaseScenario() reduzirá
     * o estoque antes de
     * commitNftPurchase() revalidá-lo.
     */

    await setMockScenario(
      page,
      'insufficient-stock',
    )

    // 10. Tenta concluir a compra
    // utilizando a quote anteriormente válida.

    await page
      .getByRole('button', {
        name:
          'Confirmar compra',
      })
      .click()

    /*
     * 11. O commit precisa perceber
     * que a quantidade disponível
     * mudou desde a cotação.
     */

    await expect(
      page.getByRole('alert'),
    ).toContainText(
      'A quantidade disponível de um dos NFTs foi alterada antes da confirmação da compra.',
    )

    /*
     * 12. Uma compra rejeitada
     * nunca pode gerar confirmação.
     */

    await expect(
      page,
    ).toHaveURL('/checkout')

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