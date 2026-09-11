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

    /*
     * 1. Visitante abre
     * o primeiro NFT.
     */
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

    /*
     * 2. Adiciona o NFT
     * ao carrinho guest.
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
     * Valida diretamente
     * o estado do carrinho.
     *
     * Não dependemos do Header,
     * pois desktop e mobile possuem
     * navegações diferentes.
     */
    await page.goto('/cart')

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

    await expect(
      page.getByText(
        '1 item no carrinho',
        {
          exact: true,
        },
      ),
    ).toBeVisible()

    /*
     * 3. Recarrega para comprovar
     * persistência do carrinho guest.
     */
    await page.reload()

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

    await expect(
      page.getByText(
        '1 item no carrinho',
        {
          exact: true,
        },
      ),
    ).toBeVisible()

    /*
     * 4. Abre autenticação.
     *
     * O Header mobile atualmente
     * não possui o mesmo botão
     * "Entrar" do desktop.
     *
     * Como este teste verifica
     * carrinho/merge e não layout
     * de autenticação, usamos
     * temporariamente o viewport
     * desktop para disparar o
     * mesmo AuthDialog.
     */
    const originalViewport =
      page.viewportSize()

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

    const needsDesktopViewport =
      !await loginButton
        .isVisible()
        .catch(() => false)

    if (
      needsDesktopViewport
    ) {
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

    /*
     * 5. Seleciona criação
     * de conta.
     *
     * Mantemos o viewport desktop
     * até o cadastro terminar.
     */
    const createAccountTab =
      authDialog.getByRole(
        'button',
        {
          name: 'Criar conta',
          exact: true,
        },
      )

    await expect(
      createAccountTab,
    ).toBeVisible()

    await createAccountTab.click()

    /*
     * Confirma que o formulário
     * realmente mudou para register
     * antes de começar a preencher.
     */
    const usernameInput =
      authDialog.locator(
        'input[autocomplete="username"]',
      )

    const emailInput =
      authDialog.locator(
        'input[autocomplete="email"]',
      )

    const passwordFields =
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
      passwordFields,
    ).toHaveCount(2)

    /*
     * 6. Cria a conta.
     *
     * A autenticação deve provocar:
     *
     * guest -> usuário autenticado
     */
    await usernameInput.fill(
      username,
    )

    await emailInput.fill(
      email,
    )

    await passwordFields
      .first()
      .fill(password)

    await passwordFields
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
     * Somente agora restauramos
     * o viewport mobile original.
     */
    if (
      needsDesktopViewport &&
      originalViewport
    ) {
      await page.setViewportSize(
        originalViewport,
      )
    }

    /*
     * 7. O NFT originalmente
     * adicionado como guest deve
     * continuar no carrinho após
     * a autenticação.
     */
    await page.goto('/cart')

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

    await expect(
      page.getByText(
        '1 item no carrinho',
        {
          exact: true,
        },
      ),
    ).toBeVisible()

    /*
     * 8. Refresh autenticado
     * comprova persistência
     * do carrinho do usuário.
     */
    await page.reload()

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

    await expect(
      page.getByText(
        '1 item no carrinho',
        {
          exact: true,
        },
      ),
    ).toBeVisible()

    /*
     * 9. Executa logout.
     *
     * Este cenário já comprovou:
     *
     * - criação de carrinho guest;
     * - persistência guest;
     * - cadastro/autenticação;
     * - merge guest -> user;
     * - persistência autenticada;
     * - logout executável.
     *
     * Isolamento de sessão entre
     * diferentes usuários deve ficar
     * nos testes específicos de auth.
     */
    await page.goto(
      '/profile',
    )

    await expect(
      page,
    ).toHaveURL(
      /\/profile/,
    )

    const logoutButton =
      page.getByRole(
        'button',
        {
          name: 'Sair',
        },
      )

    await expect(
      logoutButton,
    ).toBeVisible()

    await logoutButton.click()
  },
)