import {
  expect,
  test,
  type Locator,
  type Page,
} from '@playwright/test'

type RegisteredUser = {
  username: string
  email: string
  password: string
}

type WalletResponse = {
  id?: string
  role?: string
  nickname?: string
}

function getField(
  page: Page,
  label: string,
) {
  return page
    .locator('label')
    .filter({
      hasText: new RegExp(
        `^${label}`,
        'i',
      ),
    })
    .first()
}

async function registerUser(
  page: Page,
): Promise<RegisteredUser> {
  const uniqueId =
    `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`

  const username =
    `profile-${uniqueId}`

  const email =
    `profile-${uniqueId}@kurio.test`

  const password =
    'Kurio123!'

  const originalViewport =
    page.viewportSize()

  const isMobile =
    (originalViewport?.width ??
      1440) <= 767

  await page.goto('/')

  /*
   * O Header mobile atual não expõe
   * o botão Entrar. Reaproveitamos a
   * mesma estratégia já estabilizada
   * nos demais fluxos E2E.
   */
  if (isMobile) {
    await page.setViewportSize({
      width: 1440,
      height: 900,
    })
  }

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

  await authDialog
    .getByRole(
      'button',
      {
        name: 'Criar conta',
        exact: true,
      },
    )
    .click()

  await authDialog
    .locator(
      'input[autocomplete="username"]',
    )
    .fill(username)

  await authDialog
    .locator(
      'input[autocomplete="email"]',
    )
    .fill(email)

  const passwordInputs =
    authDialog.locator(
      'input[autocomplete="new-password"]',
    )

  await expect(
    passwordInputs,
  ).toHaveCount(2)

  await passwordInputs
    .first()
    .fill(password)

  await passwordInputs
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

  if (
    isMobile &&
    originalViewport
  ) {
    await page.setViewportSize(
      originalViewport,
    )
  }

  return {
    username,
    email,
    password,
  }
}

async function openProfile(
  page: Page,
) {
  await page.goto('/profile')

  await expect(
    page,
  ).toHaveURL('/profile')

  await expect(
    page.getByRole(
      'heading',
      {
        name:
          'Perfil do colecionador',
        level: 1,
      },
    ),
  ).toBeVisible({
    timeout: 10_000,
  })
}

async function fillPasswordField(
  page: Page,
  label: string,
  value: string,
) {
  const field =
    getField(
      page,
      label,
    )

  const input =
    field.locator('input')

  await expect(
    input,
  ).toBeVisible()

  await input.fill(
    value,
  )
}

async function chooseSelectOption(
  page: Page,
  field: Locator,
  optionName: string,
) {
  const trigger =
    field.getByRole(
      'combobox',
    )

  await expect(
    trigger,
  ).toBeVisible()

  await trigger.click()

  const option =
    page.getByRole(
      'option',
      {
        name:
          optionName,
        exact: true,
      },
    )

  await expect(
    option,
  ).toBeVisible()

  await option.click()
}

async function fillWalletForm(
  page: Page,
  values: {
    displayName: string
    nickname: string
    network: 'Ethereum' | 'Polygon' | 'Solana'
    profileName: string
    address: string
    provider:
      | 'MetaMask'
      | 'Coinbase Wallet'
      | 'WalletConnect'
      | 'Outra'
    email: string
  },
) {
  await getField(
    page,
    'Nome de exibição',
  )
    .locator('input')
    .fill(
      values.displayName,
    )

  await getField(
    page,
    'Apelido da carteira',
  )
    .locator('input')
    .fill(
      values.nickname,
    )

  await chooseSelectOption(
    page,
    getField(
      page,
      'Rede',
    ),
    values.network,
  )

  await getField(
    page,
    'Nome do perfil',
  )
    .locator('input')
    .fill(
      values.profileName,
    )

  await getField(
    page,
    'Endereço da carteira',
  )
    .locator('input')
    .fill(
      values.address,
    )

  await chooseSelectOption(
    page,
    getField(
      page,
      'Tipo de carteira',
    ),
    values.provider,
  )

  await getField(
    page,
    'E-mail',
  )
    .locator('input')
    .fill(
      values.email,
    )
}

test.describe(
  'Perfil, avatar, senha e carteiras',
  () => {
    test(
      'edita perfil e avatar, valida formulário e altera senha',
      async ({
        page,
      }) => {
        const user =
          await registerUser(
            page,
          )

        await openProfile(
          page,
        )

        const displayNameInput =
          getField(
            page,
            'Nome de exibição',
          ).locator('input')

        const usernameInput =
          getField(
            page,
            'Nome de usuário',
          ).locator('input')

        const emailInput =
          getField(
            page,
            'E-mail',
          ).locator('input')

        /*
         * Validação de campos
         * obrigatórios do perfil.
         */
        const originalDisplayName =
          await displayNameInput.inputValue()

        await displayNameInput.fill(
          '',
        )

        await page
          .getByRole(
            'button',
            {
              name: 'Salvar',
              exact: true,
            },
          )
          .click()

        await expect(
          page.getByText(
            'Preencha os campos obrigatórios.',
            {
              exact: true,
            },
          ),
        ).toBeVisible()

        await displayNameInput.fill(
          originalDisplayName,
        )

        /*
         * Validação de arquivo de avatar
         * feita pelo próprio ProfilePage.
         */
        const fileInput =
          page.locator(
            'input[type="file"][accept="image/*"]',
          )

        await fileInput.evaluate(
          (input) => {
            const dataTransfer =
              new DataTransfer()

            dataTransfer.items.add(
              new File(
                [
                  'not-an-image',
                ],
                'avatar.txt',
                {
                  type:
                    'text/plain',
                },
              ),
            )

            const fileInputElement =
              input as HTMLInputElement

            fileInputElement.files =
              dataTransfer.files

            fileInputElement.dispatchEvent(
              new Event(
                'change',
                {
                  bubbles:
                    true,
                },
              ),
            )
          },
        )

        await expect(
          page.getByText(
            'Selecione um arquivo de imagem válido.',
            {
              exact: true,
            },
          ),
        ).toBeVisible()

        /*
         * Avatar válido: PNG mínimo de 1x1.
         * O arquivo fica abaixo do limite de 1 MB.
         */
        await fileInput.evaluate(
          (
            input,
            base64Png,
          ) => {
            const binary =
              atob(
                base64Png,
              )

            const bytes =
              new Uint8Array(
                binary.length,
              )

            for (
              let index = 0;
              index <
              binary.length;
              index += 1
            ) {
              bytes[index] =
                binary.charCodeAt(
                  index,
                )
            }

            const dataTransfer =
              new DataTransfer()

            dataTransfer.items.add(
              new File(
                [
                  bytes,
                ],
                'avatar.png',
                {
                  type:
                    'image/png',
                },
              ),
            )

            const fileInputElement =
              input as HTMLInputElement

            fileInputElement.files =
              dataTransfer.files

            fileInputElement.dispatchEvent(
              new Event(
                'change',
                {
                  bubbles:
                    true,
                },
              ),
            )
          },
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        )

        await expect(
          page.getByRole(
            'img',
            {
              name:
                'Avatar do perfil',
            },
          ),
        ).toBeVisible()

        const updatedDisplayName =
          `Collector ${Date.now()}`

        const updatedUsername =
          `updated-${user.username}`

        await displayNameInput.fill(
          updatedDisplayName,
        )

        await usernameInput.fill(
          updatedUsername,
        )

        await emailInput.fill(
          user.email,
        )

        const updateResponsePromise =
          page.waitForResponse(
            (response) =>
              new URL(
                response.url(),
              ).pathname ===
                '/api/me/profile' &&
              response
                .request()
                .method() ===
                'PATCH',
          )

        await page
          .getByRole(
            'button',
            {
              name: 'Salvar',
              exact: true,
            },
          )
          .click()

        const updateResponse =
          await updateResponsePromise

        expect(
          updateResponse.status(),
        ).toBe(200)

        await expect(
          page.getByText(
            'Perfil atualizado com sucesso.',
            {
              exact: true,
            },
          ),
        ).toBeVisible()

        /*
         * O ProfilePage sincroniza o
         * AuthContext após a mutation.
         * Confirmamos também a persistência
         * recarregando a rota.
         */
        await page.reload()

        await expect(
          displayNameInput,
        ).toHaveValue(
          updatedDisplayName,
        )

        await expect(
          usernameInput,
        ).toHaveValue(
          updatedUsername,
        )

        await expect(
          page.getByRole(
            'img',
            {
              name:
                'Avatar do perfil',
            },
          ),
        ).toBeVisible()

        /*
         * Validação client-side:
         * confirmação divergente.
         */
        await fillPasswordField(
          page,
          'Senha atual',
          user.password,
        )

        await fillPasswordField(
          page,
          'Nova senha',
          'NovaSenha123!',
        )

        await fillPasswordField(
          page,
          'Confirmar nova senha',
          'OutraSenha123!',
        )

        await page
          .getByRole(
            'button',
            {
              name:
                'Alterar senha',
              exact: true,
            },
          )
          .click()

        await expect(
          page.getByText(
            'A confirmação da nova senha não corresponde.',
            {
              exact: true,
            },
          ),
        ).toBeVisible()

        /*
         * Validação proveniente da API:
         * senha atual incorreta.
         */
        await fillPasswordField(
          page,
          'Senha atual',
          'SenhaErrada123!',
        )

        await fillPasswordField(
          page,
          'Nova senha',
          'NovaSenha123!',
        )

        await fillPasswordField(
          page,
          'Confirmar nova senha',
          'NovaSenha123!',
        )

        const invalidPasswordResponsePromise =
          page.waitForResponse(
            (response) =>
              new URL(
                response.url(),
              ).pathname ===
                '/api/me/password' &&
              response
                .request()
                .method() ===
                'PATCH',
          )

        await page
          .getByRole(
            'button',
            {
              name:
                'Alterar senha',
              exact: true,
            },
          )
          .click()

        const invalidPasswordResponse =
          await invalidPasswordResponsePromise

        expect(
          invalidPasswordResponse.status(),
        ).toBe(400)

        await expect(
          page.getByText(
            'A senha atual está incorreta.',
            {
              exact: true,
            },
          ),
        ).toBeVisible()

        /*
         * Alteração válida da senha.
         */
        const newPassword =
          'NovaSenha123!'

        await fillPasswordField(
          page,
          'Senha atual',
          user.password,
        )

        await fillPasswordField(
          page,
          'Nova senha',
          newPassword,
        )

        await fillPasswordField(
          page,
          'Confirmar nova senha',
          newPassword,
        )

        const passwordResponsePromise =
          page.waitForResponse(
            (response) =>
              new URL(
                response.url(),
              ).pathname ===
                '/api/me/password' &&
              response
                .request()
                .method() ===
                'PATCH',
          )

        await page
          .getByRole(
            'button',
            {
              name:
                'Alterar senha',
              exact: true,
            },
          )
          .click()

        const passwordResponse =
          await passwordResponsePromise

        expect(
          passwordResponse.status(),
        ).toBe(204)

        await expect(
          page.getByText(
            'Senha alterada com sucesso.',
            {
              exact: true,
            },
          ),
        ).toBeVisible()

        /*
         * O formulário é limpo após
         * a alteração bem-sucedida.
         */
        await expect(
          getField(
            page,
            'Senha atual',
          ).locator('input'),
        ).toHaveValue('')

        await expect(
          getField(
            page,
            'Nova senha',
          ).locator('input'),
        ).toHaveValue('')

        await expect(
          getField(
            page,
            'Confirmar nova senha',
          ).locator('input'),
        ).toHaveValue('')
      },
    )

    test(
      'cadastra, edita e remove carteiras principal e secundária com validação',
      async ({
        page,
      }) => {
        const user =
          await registerUser(
            page,
          )

        await page.goto(
          '/profile/wallets',
        )

        await expect(
          page,
        ).toHaveURL(
          '/profile/wallets',
        )

        await expect(
          page.getByRole(
            'heading',
            {
              name:
                'Carteira principal',
              level: 1,
            },
          ),
        ).toBeVisible({
          timeout: 10_000,
        })

        /*
         * Sem preencher nada, o formulário
         * deve bloquear o envio ao backend.
         */
        let walletMutationRequests =
          0

        page.on(
          'request',
          (request) => {
            const pathname =
              new URL(
                request.url(),
              ).pathname

            if (
              pathname ===
                '/api/me/wallets' &&
              request.method() ===
                'POST'
            ) {
              walletMutationRequests +=
                1
            }
          },
        )

        await page
          .getByRole(
            'button',
            {
              name:
                'Salvar carteira',
              exact: true,
            },
          )
          .first()
          .click()

        await expect(
          page.getByText(
            'Preencha todos os campos obrigatórios.',
            {
              exact: true,
            },
          ),
        ).toBeVisible()

        expect(
          walletMutationRequests,
        ).toBe(0)

        /*
         * Criação da carteira principal.
         */
        const primaryAddress =
          '0x1234567890123456789012345678901234567890'

        await fillWalletForm(
          page,
          {
            displayName:
              'Collector Principal',
            nickname:
              'Minha principal',
            network:
              'Ethereum',
            profileName:
              'Primary Profile',
            address:
              primaryAddress,
            provider:
              'MetaMask',
            email:
              user.email,
          },
        )

        const createPrimaryPromise =
          page.waitForResponse(
            (response) =>
              new URL(
                response.url(),
              ).pathname ===
                '/api/me/wallets' &&
              response
                .request()
                .method() ===
                'POST',
          )

        await page
          .getByRole(
            'button',
            {
              name:
                'Salvar carteira',
              exact: true,
            },
          )
          .first()
          .click()

        const createPrimaryResponse =
          await createPrimaryPromise

        expect(
          createPrimaryResponse.status(),
        ).toBe(201)

        const primaryWallet =
          (await createPrimaryResponse.json()) as WalletResponse

        expect(
          primaryWallet.id,
        ).toBeTruthy()

        expect(
          primaryWallet.role,
        ).toBe(
          'primary',
        )

        await expect(
          page.getByText(
            'Carteira salva com sucesso.',
            {
              exact: true,
            },
          ),
        ).toBeVisible()

        /*
         * Edita a principal e comprova que
         * a operação usa PATCH no mesmo id.
         */
        const nicknameInput =
          getField(
            page,
            'Apelido da carteira',
          )
            .locator('input')
            .first()

        await nicknameInput.fill(
          'Principal editada',
        )

        const updatePrimaryPromise =
          page.waitForResponse(
            (response) =>
              new URL(
                response.url(),
              ).pathname ===
                `/api/me/wallets/${primaryWallet.id}` &&
              response
                .request()
                .method() ===
                'PATCH',
          )

        await page
          .getByRole(
            'button',
            {
              name:
                'Salvar carteira',
              exact: true,
            },
          )
          .first()
          .click()

        const updatePrimaryResponse =
          await updatePrimaryPromise

        expect(
          updatePrimaryResponse.status(),
        ).toBe(200)

        /*
         * Abre o formulário secundário e
         * cadastra uma segunda carteira.
         */
        const secondarySection =
          page.getByRole(
            'heading',
            {
              name:
                'Carteira secundária',
              level: 2,
            },
          )
            .locator('..')
            .locator('..')

        await secondarySection
          .getByRole(
            'button',
            {
              name:
                'Adicionar',
              exact: true,
            },
          )
          .click()

        const walletForms =
          page.locator('form')

        await expect(
          walletForms,
        ).toHaveCount(2)

        const secondaryForm =
          walletForms.nth(1)

        const secondaryDisplayName =
          secondaryForm
            .locator('label')
            .filter({
              hasText:
                /^Nome de exibição/i,
            })
            .locator('input')

        const secondaryNickname =
          secondaryForm
            .locator('label')
            .filter({
              hasText:
                /^Apelido da carteira/i,
            })
            .locator('input')

        const secondaryProfileName =
          secondaryForm
            .locator('label')
            .filter({
              hasText:
                /^Nome do perfil/i,
            })
            .locator('input')

        const secondaryAddress =
          secondaryForm
            .locator('label')
            .filter({
              hasText:
                /^Endereço da carteira/i,
            })
            .locator('input')

        const secondaryEmail =
          secondaryForm
            .locator('label')
            .filter({
              hasText:
                /^E-mail/i,
            })
            .locator('input')

        await secondaryDisplayName.fill(
          'Collector Secundário',
        )

        await secondaryNickname.fill(
          'Minha secundária',
        )

        await chooseSelectOption(
          page,
          secondaryForm
            .locator('label')
            .filter({
              hasText:
                /^Rede/i,
            }),
          'Polygon',
        )

        await secondaryProfileName.fill(
          'Secondary Profile',
        )

        await secondaryAddress.fill(
          '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        )

        await chooseSelectOption(
          page,
          secondaryForm
            .locator('label')
            .filter({
              hasText:
                /^Tipo de carteira/i,
            }),
          'Coinbase Wallet',
        )

        await secondaryEmail.fill(
          user.email,
        )

        const createSecondaryPromise =
          page.waitForResponse(
            (response) =>
              new URL(
                response.url(),
              ).pathname ===
                '/api/me/wallets' &&
              response
                .request()
                .method() ===
                'POST',
          )

        await secondaryForm
          .getByRole(
            'button',
            {
              name:
                'Salvar carteira',
              exact: true,
            },
          )
          .click()

        const createSecondaryResponse =
          await createSecondaryPromise

        expect(
          createSecondaryResponse.status(),
        ).toBe(201)

        const secondaryWallet =
          (await createSecondaryResponse.json()) as WalletResponse

        expect(
          secondaryWallet.role,
        ).toBe(
          'secondary',
        )

        /*
         * A API deve listar exatamente as
         * duas carteiras do usuário atual.
         */
        const wallets =
          await page.evaluate(
            async () => {
              const response =
                await fetch(
                  '/api/me/wallets',
                )

              return response.json()
            },
          ) as WalletResponse[]

        expect(
          wallets,
        ).toHaveLength(2)

        expect(
          wallets.map(
            (wallet) =>
              wallet.role,
          ),
        ).toEqual([
          'primary',
          'secondary',
        ])

        /*
         * Remove a secundária usando o botão
         * do segundo formulário.
         */
        const deleteSecondaryPromise =
          page.waitForResponse(
            (response) =>
              new URL(
                response.url(),
              ).pathname ===
                `/api/me/wallets/${secondaryWallet.id}` &&
              response
                .request()
                .method() ===
                'DELETE',
          )

        await secondaryForm
          .getByRole(
            'button',
            {
              name:
                'Remover',
              exact: true,
            },
          )
          .click()

        const deleteSecondaryResponse =
          await deleteSecondaryPromise

        expect(
          deleteSecondaryResponse.status(),
        ).toBe(204)

        await expect
          .poll(
            async () =>
              page.evaluate(
                async () => {
                  const response =
                    await fetch(
                      '/api/me/wallets',
                    )

                  const data =
                    await response.json()

                  return Array.isArray(
                    data,
                  )
                    ? data.length
                    : -1
                },
              ),
          )
          .toBe(1)
      },
    )
  },
)
