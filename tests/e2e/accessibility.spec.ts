import {
  expect,
  test,
  type Locator,
  type Page,
} from '@playwright/test'

async function focusByKeyboard(
  page: Page,
  target: Locator,
) {
  for (
    let attempt = 0;
    attempt < 40;
    attempt += 1
  ) {
    if (
      await target.evaluate(
        (element) =>
          element ===
          document.activeElement,
      )
    ) {
      return
    }

    await page.keyboard.press(
      'Tab',
    )
  }

  expect(
    await target.evaluate(
      (element) =>
        element ===
        document.activeElement,
    ),
  ).toBeTruthy()
}

test(
  'permite navegação por teclado, mantém foco no diálogo e associa erros aos campos',
  async ({
    page,
  }) => {
    const originalViewport =
      page.viewportSize()

    const isMobile =
      (originalViewport?.width ??
        1440) <= 767

    await page.goto('/')

    /*
     * O Header mobile atual não
     * exibe o botão Entrar.
     *
     * Abrimos o diálogo pelo Header
     * desktop usando somente teclado
     * e, depois, restauramos o viewport
     * para validar também o layout mobile.
     */
    if (isMobile) {
      await page.setViewportSize({
        width: 1440,
        height: 900,
      })
    }

    const loginButton =
      page
        .getByRole(
          'banner',
        )
        .getByRole(
          'button',
          {
            name:
              'Entrar',
            exact:
              true,
          },
        )

    await expect(
      loginButton,
    ).toBeVisible()

    await focusByKeyboard(
      page,
      loginButton,
    )

    await expect(
      loginButton,
    ).toBeFocused()

    await page.keyboard.press(
      'Enter',
    )

    const dialog =
      page.getByRole(
        'dialog',
    )

    await expect(
      dialog,
    ).toBeVisible()

    if (
      isMobile &&
      originalViewport
    ) {
      await page.setViewportSize(
        originalViewport,
      )
    }

    const emailInput =
      dialog.locator(
        '#auth-email',
      )

    /*
     * Ao abrir, o foco deve entrar
     * automaticamente no diálogo.
     */
    await expect(
      emailInput,
    ).toBeFocused()

    /*
     * Repetimos Tab várias vezes.
     * O foco nunca pode escapar do
     * modal enquanto ele estiver aberto.
     */
    for (
      let tabIndex = 0;
      tabIndex < 20;
      tabIndex += 1
    ) {
      await page.keyboard.press(
        'Tab',
      )

      const focusInsideDialog =
        await dialog.evaluate(
          (element) =>
            element.contains(
              document.activeElement,
            ),
        )

      expect(
        focusInsideDialog,
      ).toBeTruthy()
    }

    /*
     * Entramos no cadastro pelo teclado.
     */
    const createAccountButton =
      isMobile
        ? dialog.getByRole(
            'button',
            {
              name:
                /Crie uma conta/i,
            },
          )
        : dialog.getByRole(
            'button',
            {
              name:
                'Criar conta',
              exact:
                true,
            },
          )

    await expect(
      createAccountButton,
    ).toBeVisible()

    await createAccountButton.focus()

    await page.keyboard.press(
      'Enter',
    )

    const usernameInput =
      dialog.locator(
        '#auth-username',
      )

    const passwordInput =
      dialog.locator(
        '#auth-password',
      )

    const confirmPasswordInput =
      dialog.locator(
        '#auth-confirm-password',
      )

    await expect(
      usernameInput,
    ).toBeFocused()

    /*
     * Dados deliberadamente inválidos.
     * O formulário usa validação própria,
     * portanto os erros ficam disponíveis
     * também para tecnologias assistivas.
     */
    await usernameInput.fill(
      'keyboard-user',
    )

    await emailInput.fill(
      'email-invalido',
    )

    await passwordInput.fill(
      '123',
    )

    await confirmPasswordInput.fill(
      '456',
    )

    const submitButton =
      dialog.locator(
        'button[type="submit"]',
      )

    await submitButton.focus()

    await page.keyboard.press(
      'Enter',
    )

    /*
     * O primeiro campo inválido recebe
     * foco para permitir correção imediata.
     */
    await expect(
      emailInput,
    ).toBeFocused()

    await expect(
      emailInput,
    ).toHaveAttribute(
      'aria-invalid',
      'true',
    )

    await expect(
      emailInput,
    ).toHaveAttribute(
      'aria-describedby',
      'auth-email-error',
    )

    await expect(
      dialog.locator(
        '#auth-email-error',
      ),
    ).toHaveText(
      'Informe um e-mail válido.',
    )

    await expect(
      passwordInput,
    ).toHaveAttribute(
      'aria-invalid',
      'true',
    )

    await expect(
      passwordInput,
    ).toHaveAttribute(
      'aria-describedby',
      'auth-password-error',
    )

    await expect(
      dialog.locator(
        '#auth-password-error',
      ),
    ).toContainText(
      'pelo menos 6 caracteres',
    )

    await expect(
      confirmPasswordInput,
    ).toHaveAttribute(
      'aria-invalid',
      'true',
    )

    await expect(
      confirmPasswordInput,
    ).toHaveAttribute(
      'aria-describedby',
      'auth-confirm-password-error',
    )

    await expect(
      dialog.locator(
        '#auth-confirm-password-error',
      ),
    ).toHaveText(
      'A confirmação de senha não corresponde.',
    )

    /*
     * Ao corrigir, o estado inválido
     * daquele campo é removido.
     */
    await emailInput.fill(
      'keyboard@kurio.test',
    )

    await passwordInput.fill(
      'Kurio123!',
    )

    await confirmPasswordInput.fill(
      'Kurio123!',
    )

    await expect(
      emailInput,
    ).toHaveAttribute(
      'aria-invalid',
      'false',
    )

    await expect(
      passwordInput,
    ).toHaveAttribute(
      'aria-invalid',
      'false',
    )

    await expect(
      confirmPasswordInput,
    ).toHaveAttribute(
      'aria-invalid',
      'false',
    )

    /*
     * Escape encerra o modal.
     */
    await page.keyboard.press(
      'Escape',
    )

    await expect(
      dialog,
    ).toBeHidden()

    /*
     * No desktop, o elemento que abriu
     * o diálogo continua visível e deve
     * recuperar o foco.
     *
     * No mobile ele fica oculto quando
     * restauramos o viewport, portanto
     * não exigimos foco em elemento
     * display:none.
     */
    if (!isMobile) {
      await expect(
        loginButton,
      ).toBeFocused()
    }
  },
)
