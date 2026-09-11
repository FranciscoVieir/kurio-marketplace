import {
  expect,
  test,
  type Page,
} from '@playwright/test'

type TestUser = {
  username: string
  email: string
  password: string
}

async function switchToRegisterMode(
  page: Page,
) {
  const dialog =
    page.getByRole(
      'dialog',
    )

  await expect(
    dialog,
  ).toBeVisible()

  /*
   * Desktop:
   * "Criar conta"
   *
   * Mobile:
   * "Novo na Kurio? Crie uma conta"
   */
  const registerSwitch =
    dialog
      .locator(
        'button:visible',
      )
      .filter({
        hasText:
          /Criar conta|Crie uma conta/i,
      })
      .first()

  await expect(
    registerSwitch,
  ).toBeVisible()

  await registerSwitch.click()

  await expect(
    dialog.locator(
      'input[autocomplete="username"]',
    ),
  ).toBeVisible()

  return dialog
}

async function registerUser(
  page: Page,
  user: TestUser,
) {
  const dialog =
    await switchToRegisterMode(
      page,
    )

  const usernameInput =
    dialog.locator(
      'input[autocomplete="username"]',
    )

  const emailInput =
    dialog.locator(
      'input[autocomplete="email"]',
    )

  const passwordInputs =
    dialog.locator(
      'input[autocomplete="new-password"]',
    )

  await usernameInput.fill(
    user.username,
  )

  await emailInput.fill(
    user.email,
  )

  await expect(
    passwordInputs,
  ).toHaveCount(2)

  await passwordInputs
    .first()
    .fill(
      user.password,
    )

  await passwordInputs
    .nth(1)
    .fill(
      user.password,
    )

  const submitButton =
    dialog.locator(
      'button[type="submit"]',
    )

  await expect(
    submitButton,
  ).toBeEnabled()

  await submitButton.click()

  await expect(
    dialog,
  ).toBeHidden({
    timeout: 10_000,
  })
}

async function logout(
  page: Page,
) {
  const logoutButton =
    page.getByRole(
      'button',
      {
        name: 'Sair',
        exact: true,
      },
    )

  await expect(
    logoutButton,
  ).toBeVisible()

  await logoutButton.click()

  const logoutDialog =
    page.getByRole(
      'dialog',
      {
        name:
          'Sair da sua conta?',
      },
    )

  await expect(
    logoutDialog,
  ).toBeVisible()

  /*
   * O botão Cancelar recebe
   * foco quando o diálogo abre.
   */
  const cancelButton =
    logoutDialog.getByRole(
      'button',
      {
        name:
          'Cancelar',
        exact: true,
      },
    )

  await expect(
    cancelButton,
  ).toBeFocused()

  const confirmButton =
    logoutDialog.getByRole(
      'button',
      {
        name:
          'Sim, sair',
        exact: true,
      },
    )

  await expect(
    confirmButton,
  ).toBeEnabled()

  await confirmButton.click()

  await expect(
    logoutDialog,
  ).toBeHidden({
    timeout: 10_000,
  })
}

async function expectProfileIdentity(
  page: Page,
  user: TestUser,
) {
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

  const usernameInput =
    page.getByLabel(
      'Nome de usuário',
    )

  const emailInput =
    page.getByLabel(
      'E-mail',
    )

  await expect(
    usernameInput,
  ).toHaveValue(
    user.username,
  )

  await expect(
    emailInput,
  ).toHaveValue(
    user.email,
  )
}

test.describe(
  'Ciclo de autenticação',
  () => {
    test(
      'realiza logout, bloqueia rota privada e troca para outro usuário',
      async ({
        page,
      }) => {
        const uniqueId =
          Date.now().toString()

        const userA: TestUser = {
          username:
            `user-a-${uniqueId}`,
          email:
            `user-a-${uniqueId}@kurio.test`,
          password:
            'Kurio123!',
        }

        const userB: TestUser = {
          username:
            `user-b-${uniqueId}`,
          email:
            `user-b-${uniqueId}@kurio.test`,
          password:
            'Kurio123!',
        }

        /*
         * 1. Começa diretamente
         * em uma rota privada.
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
                'Entre para continuar',
            },
          ),
        ).toBeVisible({
          timeout: 10_000,
        })

        /*
         * Existem dois possíveis
         * botões "Entrar" no desktop:
         * Header + ProtectedRoute.
         *
         * O último pertence ao
         * conteúdo da rota privada.
         */
        const protectedLoginButton =
          page.getByRole(
            'button',
            {
              name:
                'Entrar',
              exact: true,
            },
          ).last()

        await expect(
          protectedLoginButton,
        ).toBeVisible()

        await protectedLoginButton.click()

        /*
         * 2. Cria e autentica
         * o usuário A.
         */
        await registerUser(
          page,
          userA,
        )

        /*
         * A rota privada deve ser
         * liberada automaticamente.
         */
        await expectProfileIdentity(
          page,
          userA,
        )

        /*
         * 3. Refresh deve restaurar
         * a sessão do usuário A.
         */
        await page.reload()

        await expectProfileIdentity(
          page,
          userA,
        )

        /*
         * 4. Executa logout pelo
         * fluxo real da interface.
         */
        await logout(
          page,
        )

        /*
         * 5. A mesma rota privada
         * precisa ficar bloqueada
         * imediatamente.
         */
        await expect(
          page.getByRole(
            'heading',
            {
              level: 1,
              name:
                'Entre para continuar',
            },
          ),
        ).toBeVisible({
          timeout: 10_000,
        })

        await expect(
          page.getByRole(
            'heading',
            {
              level: 1,
              name:
                'Perfil do colecionador',
            },
          ),
        ).toHaveCount(0)

        /*
         * Reload após logout não
         * pode restaurar user A.
         */
        await page.reload()

        await expect(
          page.getByRole(
            'heading',
            {
              level: 1,
              name:
                'Entre para continuar',
            },
          ),
        ).toBeVisible({
          timeout: 10_000,
        })

        /*
         * 6. Abre autenticação
         * novamente e cria user B.
         */
        const loginAgainButton =
          page.getByRole(
            'button',
            {
              name:
                'Entrar',
              exact: true,
            },
          ).last()

        await expect(
          loginAgainButton,
        ).toBeVisible()

        await loginAgainButton.click()

        await registerUser(
          page,
          userB,
        )

        /*
         * 7. A identidade privada
         * precisa agora pertencer
         * exclusivamente ao user B.
         */
        await expectProfileIdentity(
          page,
          userB,
        )

        const usernameInput =
          page.getByLabel(
            'Nome de usuário',
          )

        const emailInput =
          page.getByLabel(
            'E-mail',
          )

        await expect(
          usernameInput,
        ).not.toHaveValue(
          userA.username,
        )

        await expect(
          emailInput,
        ).not.toHaveValue(
          userA.email,
        )

        /*
         * 8. Refresh deve restaurar
         * exatamente a sessão B.
         *
         * Isso comprova que a sessão
         * A não reaparece depois da
         * troca de usuário.
         */
        await page.reload()

        await expectProfileIdentity(
          page,
          userB,
        )

        await expect(
          page.getByLabel(
            'Nome de usuário',
          ),
        ).not.toHaveValue(
          userA.username,
        )

        await expect(
          page.getByLabel(
            'E-mail',
          ),
        ).not.toHaveValue(
          userA.email,
        )
      },
    )
  },
)