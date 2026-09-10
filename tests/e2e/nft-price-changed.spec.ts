import {
  expect,
  test,
} from '@playwright/test'

import {
  resetMockScenario,
  setMockScenario,
} from './helpers/mock-scenario'

test(
  'impede a compra quando o preço do NFT muda após a cotação',
  async ({ page }) => {
    const uniqueId =
      Date.now().toString()

    const username =
      `price-${uniqueId}`

    const email =
      `price-${uniqueId}@kurio.test`

    const password =
      'Kurio123!'

    const walletAddress =
      '0x1234567890123456789012345678901234567890'

    await page.goto('/')

    await resetMockScenario(
      page,
    )

    // 1. Cria e autentica a conta.

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

    // 2. Cria uma wallet cadastrada
    // executando a requisição dentro
    // do browser para passar pelo MSW.

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
                    'Price E2E Collector',

                  nickname:
                    username,

                  network:
                    'ethereum',

                  profileName:
                    'Price Validation',

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

    // 3. Abre o primeiro NFT.

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

    // 4. Adiciona ao carrinho.

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

    // 5. Cria a quote ainda
    // no cenário padrão.

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

    await expect(
      page.getByText(
        nftName,
        {
          exact: true,
        },
      ),
    ).toBeVisible()

    // 6. Confirma que a wallet
    // foi carregada no checkout.

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

    // 7. Simula a conexão
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

    await expect(
      page.getByLabel('Rede *'),
    ).not.toHaveValue('')

    // 8. Simula uma alteração externa
    // no preço depois da quote.

    await setMockScenario(
      page,
      'nft-price-changed',
    )

    // 9. Tenta finalizar.

    await page
      .getByRole('button', {
        name:
          'Confirmar compra',
      })
      .click()

    // 10. O backend deve revalidar
    // o preço contra a quote.

    await expect(
      page.getByRole('alert'),
    ).toContainText(
      'O preço de um dos NFTs foi alterado após a criação da cotação.',
    )

    // 11. Compra recusada
    // não gera pedido.

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