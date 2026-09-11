import {
  expect,
  test,
} from '@playwright/test'

import {
  resetMockScenario,
  setMockScenario,
} from './helpers/mock-scenario'

test(
  'encerra a sessão expirada e permite autenticar novamente',
  async ({ page }) => {
    const uniqueId =
      Date.now().toString()

    const username =
      `session-${uniqueId}`

    const email =
      `session-${uniqueId}@kurio.test`

    const password =
      'Kurio123!'

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
     * 2. No mobile, usamos
     * temporariamente o Header
     * desktop para abrir o mesmo
     * AuthDialog da aplicação.
     */
    if (isMobile) {
      await page.setViewportSize({
        width: 1440,
        height: 900,
      })
    }

    const loginHeaderButton =
      page
        .getByRole('banner')
        .getByRole(
          'button',
          {
            name: 'Entrar',
            exact: true,
          },
        )

    await expect(
      loginHeaderButton,
    ).toBeVisible()

    await loginHeaderButton.click()

    const authDialog =
      page.getByRole(
        'dialog',
      )

    await expect(
      authDialog,
    ).toBeVisible()

    /*
     * 3. Cria uma conta.
     */
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

    const newPasswordInputs =
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
      newPasswordInputs,
    ).toHaveCount(2)

    await usernameInput.fill(
      username,
    )

    await emailInput.fill(
      email,
    )

    await newPasswordInputs
      .first()
      .fill(password)

    await newPasswordInputs
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
    ).toBeHidden({
      timeout: 10_000,
    })

    /*
     * 4. Confirma que existe
     * uma sessão autenticada.
     *
     * Ainda estamos temporariamente
     * no layout desktop.
     */
    const profileLink =
      page
        .getByRole('banner')
        .getByRole(
          'link',
          {
            name: 'Meu perfil',
          },
        )

    await expect(
      profileLink,
    ).toBeVisible()

    /*
     * Agora podemos restaurar
     * o viewport original.
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
     * 5. Expira deterministicamente
     * a sessão atual.
     */
    await setMockScenario(
      page,
      'session-expired',
    )

    /*
     * 6. Reload força o AuthProvider
     * a consultar/restaurar a sessão.
     *
     * O backend deve informar que
     * a sessão anterior expirou.
     */
    await page.reload()

    /*
     * Para verificar visualmente
     * o estado desautenticado nos
     * dois projetos, voltamos
     * temporariamente ao Header
     * desktop no mobile.
     */
    if (isMobile) {
      await page.setViewportSize({
        width: 1440,
        height: 900,
      })
    }

    const loginAfterExpiration =
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
     * 7. A identidade anterior
     * precisa ter sido removida.
     */
    await expect(
      loginAfterExpiration,
    ).toBeVisible({
      timeout: 10_000,
    })

    await expect(
      page
        .getByRole('banner')
        .getByRole(
          'link',
          {
            name: 'Meu perfil',
          },
        ),
    ).toHaveCount(0)

    /*
     * 8. O cenário de expiração
     * cumpriu seu papel.
     *
     * Voltamos ao comportamento
     * padrão para testar recuperação
     * através de novo login.
     */
    await resetMockScenario(
      page,
    )

    /*
     * 9. Autentica novamente
     * com a mesma conta.
     */
    await loginAfterExpiration.click()

    const loginDialog =
      page.getByRole(
        'dialog',
      )

    await expect(
      loginDialog,
    ).toBeVisible()

    const loginEmailInput =
      loginDialog.locator(
        'input[autocomplete="email"]',
      )

    const currentPasswordInput =
      loginDialog.locator(
        'input[autocomplete="current-password"]',
      )

    await expect(
      loginEmailInput,
    ).toBeVisible()

    await expect(
      currentPasswordInput,
    ).toBeVisible()

    await loginEmailInput.fill(
      email,
    )

    await currentPasswordInput.fill(
      password,
    )

    const submitLoginButton =
      loginDialog.locator(
        'button[type="submit"]',
      )

    await expect(
      submitLoginButton,
    ).toBeEnabled()

    await submitLoginButton.click()

    /*
     * 10. O novo login deve
     * criar uma sessão válida.
     */
    await expect(
      loginDialog,
    ).toBeHidden({
      timeout: 10_000,
    })

    await expect(
      page
        .getByRole('banner')
        .getByRole(
          'link',
          {
            name: 'Meu perfil',
          },
        ),
    ).toBeVisible()

    /*
     * 11. Confirma que a nova
     * sessão realmente dá acesso
     * aos dados privados.
     */
    await page.goto(
      '/profile',
    )

    await expect(
      page.getByRole(
        'heading',
        {
          level: 1,
          name:
            'Perfil do colecionador',
        },
      ),
    ).toBeVisible({
      timeout: 10_000,
    })

    /*
     * Restaura mobile apenas
     * no fim do cenário.
     */
    if (
      isMobile &&
      originalViewport
    ) {
      await page.setViewportSize(
        originalViewport,
      )
    }
  },
)

test.afterEach(
  async ({ page }) => {
    await resetMockScenario(
      page,
    )
  },
)