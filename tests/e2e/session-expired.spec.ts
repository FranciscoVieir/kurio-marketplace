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

    await page.goto('/')

    await resetMockScenario(
      page,
    )

    // 1. Cria uma conta e inicia
    // uma sessão válida.
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

    // 2. Confirma que o usuário
    // realmente está autenticado.
    await expect(
      page
        .getByRole('banner')
        .getByRole('link', {
          name: 'Meu perfil',
        }),
    ).toBeVisible()

    /*
     * 3. O endpoint determinístico
     * expira a sessão atualmente
     * persistida no mock backend.
     */
    await setMockScenario(
      page,
      'session-expired',
    )

    /*
     * 4. Ao recarregar a aplicação,
     * o AuthProvider executa
     * getSession() novamente.
     *
     * Como a sessão foi expirada,
     * a request falha e o contexto
     * limpa user/session.
     */
    await page.reload()

    // Aguarda a inicialização do app
    // terminar após o reload.
    await expect(
      page
        .getByRole('banner')
        .getByRole('button', {
          name: 'Entrar',
        }),
    ).toBeVisible()

    /*
     * 5. A identidade autenticada
     * anterior não pode continuar
     * aparecendo no Header.
     */
    await expect(
      page
        .getByRole('banner')
        .getByRole('link', {
          name: 'Meu perfil',
        }),
    ).toHaveCount(0)

    // 6. O usuário deve conseguir
    // entrar novamente com a mesma conta.
    await page
      .getByRole('banner')
      .getByRole('button', {
        name: 'Entrar',
      })
      .click()

    const loginDialog =
      page.getByRole('dialog')

    await expect(
      loginDialog,
    ).toBeVisible()

    await expect(
      loginDialog.getByRole(
        'heading',
        {
          level: 2,
          name: 'Bem-vindo de volta',
        },
      ),
    ).toBeVisible()

    await loginDialog
      .getByLabel('E-mail')
      .fill(email)

    await loginDialog
      .locator(
        'input[autocomplete="current-password"]',
      )
      .fill(password)

    await loginDialog
      .locator(
        'button[type="submit"]',
      )
      .click()

    // 7. O novo login cria
    // uma nova sessão válida.
    await expect(
      loginDialog,
    ).toBeHidden()

    await expect(
      page
        .getByRole('banner')
        .getByRole('link', {
          name: 'Meu perfil',
        }),
    ).toBeVisible()
  },
)

test.afterEach(
  async ({ page }) => {
    await resetMockScenario(
      page,
    )
  },
)