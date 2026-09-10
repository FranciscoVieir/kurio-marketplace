import {
  expect,
  test,
} from '@playwright/test'

test(
  'conclui uma compra do catálogo até a confirmação do pedido',
  async ({ page }) => {
    const uniqueId =
      Date.now().toString()

    const username =
      `playwright-${uniqueId}`

    const email =
      `playwright-${uniqueId}@kurio.test`

    const password =
      'Kurio123!'

    const walletAddress =
      '0x1234567890123456789012345678901234567890'

    await page.goto('/')

    // 1. Cria uma conta real pela interface.

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

    await expect(
      authDialog.getByRole(
        'heading',
        {
          level: 2,
          name: 'Crie sua conta',
        },
      ),
    ).toBeVisible()

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

    // O cadastro também autentica o usuário.

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
    // usando a própria API mock,
    // mas executando o fetch dentro
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

    // 3. Aguarda o catálogo
    // e abre o primeiro NFT.

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

    // 4. Adiciona uma unidade ao carrinho.

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

    // 5. O Header deve refletir
    // o estado do carrinho.

    const cartLink =
      page.getByRole(
        'link',
        {
          name:
            'Carrinho com 1 item',
        },
      )

    await expect(
      cartLink,
    ).toBeVisible()

    await cartLink.click()

    await expect(
      page,
    ).toHaveURL('/cart')

    await expect(
      page.getByRole(
        'heading',
        {
          level: 1,
          name: 'Seu carrinho',
        },
      ),
    ).toBeVisible()

    await expect(
      page.getByText(
        '1 item no carrinho',
        {
          exact: true,
        },
      ),
    ).toBeVisible()

    // 6. Avança para o checkout.

    await page
      .getByRole('link', {
        name:
          'Conectar e finalizar',
      })
      .click()

    await expect(
      page,
    ).toHaveURL('/checkout')

    // A quote é criada automaticamente.

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

    // 7. A wallet cadastrada
// deve ser carregada no checkout.

const walletSelect =
  page.locator('select').filter({
    has: page.locator('option', {
      hasText: username,
    }),
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
    name: 'Conectar carteira',
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

    // A rede deve continuar
    // compatível com a quote.

    await expect(
      page.getByLabel('Rede *'),
    ).not.toHaveValue('')

    // MetaMask vem da wallet primária.

    await expect(
      page.getByRole(
        'radio',
        {
          name: /MetaMask/i,
        },
      ),
    ).toBeChecked()

    // 9. Confirma a compra.

    await page
      .getByRole('button', {
        name:
          'Confirmar compra',
      })
      .click()

    // 10. O backend cria o pedido
    // e a aplicação navega
    // para a confirmação.

    await expect(
      page,
    ).toHaveURL(
      /\/orders\/[^/]+$/,
    )

    // 11. O pedido deve ser confirmado
    // pelo evento realtime do Socket.IO.

    await expect(
      page
        .getByText(
          /confirmado|confirmada/i,
        )
        .first(),
    ).toBeVisible({
      timeout: 10_000,
    })

    // 12. O NFT comprado
    // permanece identificado.

    await expect(
      page.getByText(
        nftName,
        {
          exact: true,
        },
      ),
    ).toBeVisible()
  },
)