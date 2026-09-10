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

    await page.goto('/')

    // 1. Garante o cenário padrão no início.

    await resetMockScenario(
      page,
    )

    // 2. Cria uma conta pela interface.

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
    // passar pela camada de mocks do MSW.

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

    await firstNftLink.click()

    await expect(
      page,
    ).toHaveURL(
      /\/nft\/.+/,
    )

    // 5. Adiciona o NFT ao carrinho.

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

    // 6. Ativa o cenário ANTES
    // da criação da quote.
    //
    // Diferentemente dos cenários
    // de preço/versão/estoque,
    // queremos que a própria quote
    // seja criada já expirada.

    await setMockScenario(
      page,
      'quote-expired',
    )

    await page
      .getByRole('link', {
        name:
          'Conectar e finalizar',
      })
      .click()

    await expect(
      page,
    ).toHaveURL('/checkout')

    // A tela de checkout continua válida:
    // somente a expiração da quote
    // foi alterada.

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

    // 7. Confirma que a wallet
    // cadastrada foi carregada
    // automaticamente no checkout.

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

    await expect(
      page.getByLabel('Rede *'),
    ).not.toHaveValue('')

    // 8. Simula a conexão
    // da wallet cadastrada.

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

    // 9. Tenta finalizar usando
    // a quote expirada.

    await page
      .getByRole('button', {
        name:
          'Confirmar compra',
      })
      .click()

    // 10. O backend deve
    // rejeitar a compra.

    await expect(
      page.getByRole('alert'),
    ).toContainText(
      'A cotação expirou. Gere uma nova cotação antes de finalizar a compra.',
    )

    // 11. Não pode existir navegação
    // para confirmação.

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