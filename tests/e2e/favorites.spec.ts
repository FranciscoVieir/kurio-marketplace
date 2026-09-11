import {
  expect,
  test,
  type Page,
} from '@playwright/test'

import {
  resetMockScenario,
  setMockScenario,
} from './helpers/mock-scenario'

type TestUser = {
  username: string
  email: string
  password: string
}

function escapeRegExp(
  value: string,
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
}

async function registerUser(
  page: Page,
  user: TestUser,
) {
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

  const loginButton =
    page.getByRole(
      'button',
      {
        name: 'Entrar',
        exact: true,
      },
    ).last()

  await expect(
    loginButton,
  ).toBeVisible()

  await loginButton.click()

  const dialog =
    page.getByRole(
      'dialog',
    )

  await expect(
    dialog,
  ).toBeVisible()

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

  await expect(
    usernameInput,
  ).toBeVisible()

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
}

async function openFirstNft(
  page: Page,
) {
  await page.goto('/')

  const firstNftLink =
    page
      .locator(
        '#catalog article a',
      )
      .first()

  await expect(
    firstNftLink,
  ).toBeVisible({
    timeout: 10_000,
  })

  const nftName =
    (
      await firstNftLink
        .locator('h3')
        .innerText()
    ).trim()

  const href =
    await firstNftLink.getAttribute(
      'href',
    )

  expect(
    href,
  ).toBeTruthy()

  await page.goto(
    href!,
  )

  await expect(
    page
      .locator(
        'h1:visible',
      )
      .filter({
        hasText:
          nftName,
      })
      .first(),
  ).toBeVisible({
    timeout: 10_000,
  })

  return {
    nftName,
    href: href!,
  }
}

function getFavoriteButton(
  page: Page,
  nftName: string,
) {
  const escapedName =
    escapeRegExp(
      nftName,
    )

  /*
   * O aria-label muda junto
   * com o estado:
   *
   * Adicionar NFT aos favoritos
   * Remover NFT dos favoritos
   *
   * Portanto o locator precisa
   * aceitar os dois estados.
   */
  return page.getByRole(
    'button',
    {
      name: new RegExp(
        `(?:Adicionar ${escapedName} aos favoritos|Remover ${escapedName} dos favoritos)`,
        'i',
      ),
    },
  )
}

function waitForFavoriteMutation(
  page: Page,
  nftHref: string,
) {
  const nftId =
    nftHref
      .split('/nft/')
      .at(-1)
      ?.split(/[?#]/)[0]

  expect(
    nftId,
  ).toBeTruthy()

  return page.waitForResponse(
    (response) => {
      const url =
        new URL(
          response.url(),
        )

      return (
        response
          .request()
          .method() ===
          'PUT' &&
        url.pathname ===
          `/api/favorites/${nftId}`
      )
    },
    {
      timeout: 10_000,
    },
  )
}

test.describe(
  'Favoritos',
  () => {
    test(
      'favorita, persiste após refresh, aparece na lista e permite remover',
      async ({
        page,
      }) => {
        const uniqueId =
          Date.now().toString()

        const user: TestUser = {
          username:
            `favorite-${uniqueId}`,
          email:
            `favorite-${uniqueId}@kurio.test`,
          password:
            'Kurio123!',
        }

        await page.goto('/')

        await resetMockScenario(
          page,
        )

        /*
         * Favoritos privados devem
         * pertencer ao usuário
         * autenticado.
         */
        await registerUser(
          page,
          user,
        )

        const {
          nftName,
          href,
        } =
          await openFirstNft(
            page,
          )

        const favoriteButton =
          getFavoriteButton(
            page,
            nftName,
          )

        await expect(
          favoriteButton,
        ).toBeVisible()

        await expect(
          favoriteButton,
        ).toHaveAttribute(
          'aria-pressed',
          'false',
        )

        /*
         * Favorita através da
         * mutation interceptada
         * pelo MSW.
         */
        const favoriteResponse =
          waitForFavoriteMutation(
            page,
            href,
          )

        await favoriteButton.click()

        const response =
          await favoriteResponse

        expect(
          response.status(),
        ).toBe(200)

        /*
         * Mesmo com o aria-label
         * mudando de Adicionar para
         * Remover, o locator continua
         * encontrando o botão.
         */
        await expect(
          getFavoriteButton(
            page,
            nftName,
          ),
        ).toHaveAttribute(
          'aria-pressed',
          'true',
        )

        /*
         * Confirma também a mudança
         * semântica do accessible name.
         */
        await expect(
          page.getByRole(
            'button',
            {
              name:
                `Remover ${nftName} dos favoritos`,
              exact: true,
            },
          ),
        ).toBeVisible()

        /*
         * Refresh deve restaurar
         * o favorito persistido.
         */
        await page.reload()

        const favoriteAfterReload =
          getFavoriteButton(
            page,
            nftName,
          )

        await expect(
          favoriteAfterReload,
        ).toBeVisible({
          timeout: 10_000,
        })

        await expect(
          favoriteAfterReload,
        ).toHaveAttribute(
          'aria-pressed',
          'true',
        )

        /*
         * O NFT precisa aparecer
         * na área privada de
         * favoritos.
         */
        await page.goto(
          '/profile/favorites',
        )

        await expect(
          page.getByRole(
            'heading',
            {
              level: 1,
              name:
                'Lista de interesse',
            },
          ),
        ).toBeVisible({
          timeout: 10_000,
        })

        await expect(
          page.getByText(
            '1 NFT salvo',
            {
              exact: true,
            },
          ),
        ).toBeVisible({
          timeout: 10_000,
        })

        await expect(
          page.getByRole(
            'link',
            {
              name:
                nftName,
              exact: true,
            },
          ).first(),
        ).toBeVisible()

        /*
         * Remove pela própria
         * Lista de interesse.
         */
        const removeButton =
          page.getByRole(
            'button',
            {
              name:
                `Remover ${nftName} dos favoritos`,
              exact: true,
            },
          )

        await expect(
          removeButton,
        ).toBeVisible()

        const removeResponse =
          waitForFavoriteMutation(
            page,
            href,
          )

        await removeButton.click()

        const removed =
          await removeResponse

        expect(
          removed.status(),
        ).toBe(200)

        await expect(
          page.getByRole(
            'heading',
            {
              level: 2,
              name:
                'Sua lista está vazia',
            },
          ),
        ).toBeVisible({
          timeout: 10_000,
        })

        /*
         * Remoção também precisa
         * sobreviver ao refresh.
         */
        await page.reload()

        await expect(
          page.getByRole(
            'heading',
            {
              level: 2,
              name:
                'Sua lista está vazia',
            },
          ),
        ).toBeVisible({
          timeout: 10_000,
        })
      },
    )

    test(
      'faz rollback após falha da mutation e permite recuperação',
      async ({
        page,
      }) => {
        const uniqueId =
          Date.now().toString()

        const user: TestUser = {
          username:
            `rollback-${uniqueId}`,
          email:
            `rollback-${uniqueId}@kurio.test`,
          password:
            'Kurio123!',
        }

        await page.goto('/')

        await resetMockScenario(
          page,
        )

        await registerUser(
          page,
          user,
        )

        const {
          nftName,
          href,
        } =
          await openFirstNft(
            page,
          )

        const favoriteButton =
          getFavoriteButton(
            page,
            nftName,
          )

        await expect(
          favoriteButton,
        ).toBeVisible()

        await expect(
          favoriteButton,
        ).toHaveAttribute(
          'aria-pressed',
          'false',
        )

        /*
         * Ativa deterministicamente
         * a falha da mutation.
         */
        await setMockScenario(
          page,
          'favorite-mutation-error',
        )

        const failedResponse =
          waitForFavoriteMutation(
            page,
            href,
          )

        /*
         * Dispara a mutation.
         */
        await favoriteButton.click()

        /*
         * Optimistic update:
         *
         * antes do backend responder,
         * a UI precisa considerar
         * o NFT favoritado.
         *
         * O accessible name muda para
         * "Remover ... dos favoritos".
         */
        await expect(
          page.getByRole(
            'button',
            {
              name:
                `Remover ${nftName} dos favoritos`,
              exact: true,
            },
          ),
        ).toHaveAttribute(
          'aria-pressed',
          'true',
          {
            timeout: 2_000,
          },
        )

        const failure =
          await failedResponse

        expect(
          failure.status(),
        ).toBe(500)

        /*
         * Mutation falhou:
         *
         * o estado otimista precisa
         * ser revertido.
         */
        const favoriteAfterRollback =
          getFavoriteButton(
            page,
            nftName,
          )

        await expect(
          favoriteAfterRollback,
        ).toHaveAttribute(
          'aria-pressed',
          'false',
          {
            timeout: 10_000,
          },
        )

        await expect(
          page.getByRole(
            'button',
            {
              name:
                `Adicionar ${nftName} aos favoritos`,
              exact: true,
            },
          ),
        ).toBeVisible()

        await expect(
          page.getByRole(
            'alert',
          ),
        ).toContainText(
          'Não foi possível atualizar o favorito. A alteração foi desfeita.',
        )

        /*
         * Refresh confirma que o
         * estado incorreto não foi
         * persistido.
         */
        await page.reload()

        const favoriteAfterReload =
          getFavoriteButton(
            page,
            nftName,
          )

        await expect(
          favoriteAfterReload,
        ).toHaveAttribute(
          'aria-pressed',
          'false',
          {
            timeout: 10_000,
          },
        )

        /*
         * Recuperação:
         * backend volta ao normal.
         */
        await resetMockScenario(
          page,
        )

        const retryResponse =
          waitForFavoriteMutation(
            page,
            href,
          )

        await favoriteAfterReload.click()

        const retry =
          await retryResponse

        expect(
          retry.status(),
        ).toBe(200)

        await expect(
          getFavoriteButton(
            page,
            nftName,
          ),
        ).toHaveAttribute(
          'aria-pressed',
          'true',
        )

        /*
         * Sucesso após retry precisa
         * sobreviver a refresh.
         */
        await page.reload()

        await expect(
          getFavoriteButton(
            page,
            nftName,
          ),
        ).toHaveAttribute(
          'aria-pressed',
          'true',
          {
            timeout: 10_000,
          },
        )

        /*
         * E também aparecer na
         * Lista de interesse.
         */
        await page.goto(
          '/profile/favorites',
        )

        await expect(
          page.getByText(
            '1 NFT salvo',
            {
              exact: true,
            },
          ),
        ).toBeVisible({
          timeout: 10_000,
        })

        await expect(
          page.getByRole(
            'link',
            {
              name:
                nftName,
              exact: true,
            },
          ).first(),
        ).toBeVisible()
      },
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