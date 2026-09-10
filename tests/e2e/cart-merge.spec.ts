import {
  expect,
  test,
} from '@playwright/test'

test(
  'mescla o carrinho guest ao autenticar sem vazar dados no logout',
  async ({ page }) => {
    const uniqueId =
      Date.now().toString()

    const username =
      `cart-${uniqueId}`

    const email =
      `cart-${uniqueId}@kurio.test`

    const password =
      'Kurio123!'

    await page.goto('/')

    // 1. Como visitante, abre o primeiro NFT.
    const firstNftLink = page
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

    // 2. Adiciona uma unidade
    // ao carrinho guest.
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

    await expect(
      page.getByRole('link', {
        name: 'Carrinho com 1 item',
      }),
    ).toBeVisible()

    // 3. Recarrega para provar
    // persistência do carrinho guest.
    await page.reload()

    await expect(
      page.getByRole('link', {
        name: 'Carrinho com 1 item',
      }),
    ).toBeVisible()

    // 4. Cria uma conta.
    //
    // Neste momento o CartProvider
    // deve executar guest → user merge.
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

    // 5. O item guest deve continuar
    // presente após a autenticação.
    await expect(
      page.getByRole('link', {
        name: 'Carrinho com 1 item',
      }),
    ).toBeVisible()

    // 6. Abre o carrinho autenticado
    // e confirma que é o mesmo NFT.
    await page
      .getByRole('link', {
        name: 'Carrinho com 1 item',
      })
      .click()

    await expect(
      page,
    ).toHaveURL('/cart')

    await expect(
      page.getByText(
        nftName,
        {
          exact: true,
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

    // 7. Recarrega autenticado.
    //
    // Agora validamos a persistência
    // no storage do owner da conta.
    await page.reload()

    await expect(
      page.getByText(
        nftName,
        {
          exact: true,
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

    // 8. Vai para o perfil para fazer logout.
    await page
      .getByRole('banner')
      .getByRole('link', {
        name: 'Meu perfil',
      })
      .click()

    await expect(
      page,
    ).toHaveURL(
      /\/profile/,
    )

    // O menu do perfil possui a ação "Sair".
    await page
      .getByRole('button', {
        name: 'Sair',
      })
      .click()

    // 9. Confirma que voltou
    // para estado não autenticado.
    await expect(
      page
        .getByRole('banner')
        .getByRole('button', {
          name: 'Entrar',
        }),
    ).toBeVisible()

    /*
     * 10. Aguarda qualquer modal
     * remanescente do logout fechar
     * completamente antes de interagir
     * novamente com o Header.
     */
    await expect(
      page.getByRole('dialog'),
    ).toHaveCount(0)

    /*
     * 11. O carrinho privado da conta
     * não deve ser copiado de volta
     * para o owner guest.
     *
     * Como o merge consumiu o carrinho
     * guest, esperamos que o Header
     * indique carrinho vazio.
     */
    const guestCartLink =
      page.getByRole('link', {
        name: 'Carrinho vazio',
      })

    await expect(
      guestCartLink,
    ).toBeVisible()

    await guestCartLink.click()

    await expect(
      page,
    ).toHaveURL('/cart')

    await expect(
  page.getByRole(
    'heading',
    {
      level: 2,
      name: 'Seu carrinho está vazio',
    },
  ),
  ).toBeVisible()

    // 12. O NFT privado da conta
    // não pode aparecer no carrinho guest.
    await expect(
      page.getByText(
        nftName,
        {
          exact: true,
        },
      ),
    ).toHaveCount(0)
  },
)