import {
  expect,
  test,
} from '@playwright/test'

import {
  resetMockScenario,
  setMockScenario,
} from './helpers/mock-scenario'

async function waitForInitialCatalog(
  page: import('@playwright/test').Page,
) {
  await page.goto('/')

  /*
   * Antes de ativar um cenário,
   * esperamos a request inicial
   * terminar.
   *
   * Isso é importante porque o
   * handler do catálogo possui delay
   * e poderia consumir uma tentativa
   * de catalog-error caso o cenário
   * fosse ativado enquanto a request
   * padrão ainda estivesse pendente.
   */
  await expect(
    page
      .locator(
        '#catalog article',
      )
      .first(),
  ).toBeVisible({
    timeout: 10_000,
  })
}

test.describe(
  'Carregamento e recuperação de falhas',
  () => {
    test.afterEach(
      async ({
        page,
      }) => {
        await resetMockScenario(
          page,
        )
      },
    )

    test(
      'exibe skeleton durante carregamento lento e depois renderiza o catálogo',
      async ({
        page,
      }) => {
        await waitForInitialCatalog(
          page,
        )

        await setMockScenario(
          page,
          'catalog-slow',
        )

        /*
         * O cenário fica salvo em
         * sessionStorage.
         *
         * O reload recria o QueryClient,
         * garantindo uma nova consulta
         * sem aproveitar cache anterior.
         */
        await page.reload()

        const loadingState =
          page.getByLabel(
            'Carregando NFTs',
          )

        await expect(
          loadingState,
        ).toBeVisible({
          timeout: 5_000,
        })

        await expect(
          loadingState,
        ).toHaveAttribute(
          'aria-busy',
          'true',
        )

        /*
         * Confirma que não é apenas
         * um texto de loading:
         * existe ao menos um bloco
         * configurado com shimmer.
         */
        const shimmerElement =
          loadingState.locator(
            '[class*="animate-[shimmer_1.6s_infinite]"]',
          )

        await expect(
          shimmerElement.first(),
        ).toBeVisible()

        await expect(
          page
            .locator(
              '#catalog article',
            )
            .first(),
        ).toBeVisible({
          timeout: 10_000,
        })

        await expect(
          loadingState,
        ).toBeHidden()
      },
    )

    test(
      'mostra feedback após falha e recupera o catálogo após nova tentativa',
      async ({
        page,
      }) => {
        await waitForInitialCatalog(
          page,
        )

        await setMockScenario(
          page,
          'catalog-error',
        )

        const catalogStatuses: number[] =
          []

        page.on(
          'response',
          (response) => {
            const url =
              new URL(
                response.url(),
              )

            if (
              url.pathname ===
                '/api/nfts' &&
              response
                .request()
                .method() ===
                'GET'
            ) {
              catalogStatuses.push(
                response.status(),
              )
            }
          },
        )

        /*
         * 1ª consulta:
         *   503
         *
         * retry automático do
         * TanStack Query:
         *   503
         *
         * Com retry: 1, a interface
         * deve então entrar em erro.
         */
        await page.reload()

        const errorFeedback =
          page.getByRole(
            'alert',
          )

        await expect(
          errorFeedback,
        ).toContainText(
          'Não foi possível carregar os NFTs',
          {
            timeout: 10_000,
          },
        )

        await expect(
          errorFeedback,
        ).toContainText(
          'Ocorreu um erro ao carregar o catálogo.',
        )

        /*
         * Garante que a política
         * retry: 1 realmente produziu
         * duas falhas antes do estado
         * de erro ser apresentado.
         *
         * Não validamos o array inteiro
         * porque outros refetches válidos
         * podem ocorrer em background.
         */
        expect(
          catalogStatuses.filter(
            (status) =>
              status === 503,
          ),
        ).toHaveLength(2)

        const retryButton =
          errorFeedback.getByRole(
            'button',
            {
              name:
                'Tentar novamente',
              exact: true,
            },
          )

        await expect(
          retryButton,
        ).toBeVisible()

        await retryButton.click()

        /*
         * O contador do cenário já
         * consumiu as duas falhas.
         *
         * A nova tentativa deve usar
         * o handler normal e retornar
         * sucesso.
         */
        await expect(
          page
            .locator(
              '#catalog article',
            )
            .first(),
        ).toBeVisible({
          timeout: 10_000,
        })

        await expect(
          errorFeedback,
        ).toBeHidden()

        /*
         * Continua exigindo exatamente
         * duas respostas 503...
         */
        expect(
          catalogStatuses.filter(
            (status) =>
              status === 503,
          ),
        ).toHaveLength(2)

        /*
         * ...e pelo menos uma resposta
         * 200 após a recuperação.
         *
         * Refetches adicionais com 200
         * são válidos e não representam
         * falha funcional.
         */
        expect(
          catalogStatuses.some(
            (status) =>
              status === 200,
          ),
        ).toBe(true)
      },
    )
  },
)