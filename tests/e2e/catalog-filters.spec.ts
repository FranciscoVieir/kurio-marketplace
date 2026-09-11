import {
  expect,
  test,
  type Page,
} from '@playwright/test'

type ExpectedCatalogParams =
  Record<
    string,
    string
  >

function isCatalogRequest(
  url: string,
) {
  return (
    new URL(url)
      .pathname ===
    '/api/nfts'
  )
}

/*
 * TanStack Router preserva tipos
 * dos search params.
 *
 * Uma string que parece número,
 * como "0.02", pode aparecer na URL
 * serializada como:
 *
 * minPrice="0.02"
 *
 * Este helper normaliza o valor
 * para aquilo que a aplicação
 * efetivamente recebe.
 */
function getUrlParam(
  page: Page,
  key: string,
) {
  const value =
    new URL(
      page.url(),
    ).searchParams.get(
      key,
    )

  if (value === null) {
    return null
  }

  try {
    const parsed =
      JSON.parse(
        value,
      ) as unknown

    if (
      typeof parsed ===
      'string'
    ) {
      return parsed
    }

    if (
      typeof parsed ===
        'number' ||
      typeof parsed ===
        'boolean'
    ) {
      return String(
        parsed,
      )
    }

    return value
  } catch {
    return value
  }
}

async function waitForCatalogRequest(
  page: Page,
  expectedParams:
    ExpectedCatalogParams,
  action: () =>
    Promise<void>,
) {
  const requestPromise =
    page.waitForRequest(
      (request) => {
        if (
          request.method() !==
            'GET' ||
          !isCatalogRequest(
            request.url(),
          )
        ) {
          return false
        }

        const url =
          new URL(
            request.url(),
          )

        return Object.entries(
          expectedParams,
        ).every(
          ([
            key,
            value,
          ]) =>
            url.searchParams.get(
              key,
            ) === value,
        )
      },
      {
        timeout: 10_000,
      },
    )

  await action()

  const request =
    await requestPromise

  const url =
    new URL(
      request.url(),
    )

  for (
    const [
      key,
      value,
    ] of Object.entries(
      expectedParams,
    )
  ) {
    expect(
      url.searchParams.get(
        key,
      ),
    ).toBe(value)
  }
}

async function waitForCatalog(
  page: Page,
) {
  await expect(
    page.locator(
      '#catalog article',
    ),
  ).toHaveCount(
    9,
    {
      timeout: 10_000,
    },
  )
}

test.describe(
  'Catálogo',
  () => {
    test(
      'pesquisa NFTs, persiste a busca na URL e restaura após refresh',
      async ({
        page,
      }) => {
        await page.goto('/')

        await waitForCatalog(
          page,
        )

        /*
         * Usa um NFT real do
         * catálogo para manter
         * a busca determinística.
         */
        const firstNftTitle =
          (
            await page
              .locator(
                '#catalog article h3',
              )
              .first()
              .innerText()
          ).trim()

        expect(
          firstNftTitle.length,
        ).toBeGreaterThan(0)

        /*
         * Existe um campo de busca
         * desktop e outro mobile.
         *
         * Interagimos somente com
         * aquele que está visível.
         */
        const searchInput =
          page.locator(
            'input[type="search"]:visible',
          )

        await expect(
          searchInput,
        ).toBeVisible()

        /*
         * A busca precisa chegar
         * à API e atualizar a URL.
         */
        await waitForCatalogRequest(
          page,
          {
            search:
              firstNftTitle,
            page: '1',
          },
          async () => {
            await searchInput.fill(
              firstNftTitle,
            )
          },
        )

        await expect
          .poll(() =>
            getUrlParam(
              page,
              'search',
            ),
          )
          .toBe(
            firstNftTitle,
          )

        await expect(
          page
            .locator(
              '#catalog article h3',
            )
            .filter({
              hasText:
                firstNftTitle,
            })
            .first(),
        ).toBeVisible({
          timeout: 10_000,
        })

        /*
         * Refresh não pode
         * apagar a pesquisa.
         */
        await page.reload()

        await expect(
          page.locator(
            'input[type="search"]:visible',
          ),
        ).toHaveValue(
          firstNftTitle,
        )

        await expect
          .poll(() =>
            getUrlParam(
              page,
              'search',
            ),
          )
          .toBe(
            firstNftTitle,
          )

        await expect(
          page
            .locator(
              '#catalog article h3',
            )
            .filter({
              hasText:
                firstNftTitle,
            })
            .first(),
        ).toBeVisible({
          timeout: 10_000,
        })

        /*
         * Limpar a busca também
         * precisa chegar à API.
         */
        const refreshedSearch =
          page.locator(
            'input[type="search"]:visible',
          )

        await waitForCatalogRequest(
          page,
          {
            page: '1',
          },
          async () => {
            await refreshedSearch.fill(
              '',
            )
          },
        )

        await expect
          .poll(() =>
            getUrlParam(
              page,
              'search',
            ),
          )
          .toBeNull()

        await waitForCatalog(
          page,
        )
      },
    )

    test(
      'altera abas do catálogo e reflete o estado na URL e na API',
      async ({
        page,
      }) => {
        await page.goto('/')

        await waitForCatalog(
          page,
        )

        const trendingTab =
          page.getByRole(
            'tab',
            {
              name:
                'Em alta',
            },
          )

        await expect(
          trendingTab,
        ).toHaveAttribute(
          'aria-selected',
          'false',
        )

        await waitForCatalogRequest(
          page,
          {
            tab:
              'trending',
            page: '1',
          },
          async () => {
            await trendingTab.click()
          },
        )

        await expect(
          trendingTab,
        ).toHaveAttribute(
          'aria-selected',
          'true',
        )

        await expect
          .poll(() =>
            getUrlParam(
              page,
              'tab',
            ),
          )
          .toBe(
            'trending',
          )

        /*
         * Retorna ao valor padrão.
         */
        const allTab =
          page.getByRole(
            'tab',
            {
              name:
                'Todos os NFTs',
            },
          )

        await waitForCatalogRequest(
          page,
          {
            tab: 'all',
            page: '1',
          },
          async () => {
            await allTab.click()
          },
        )

        await expect(
          allTab,
        ).toHaveAttribute(
          'aria-selected',
          'true',
        )

        /*
         * stripSearchParams remove
         * tab=all por ser default.
         */
        await expect
          .poll(() =>
            getUrlParam(
              page,
              'tab',
            ),
          )
          .toBeNull()
      },
    )

    test(
      'pagina o catálogo, persiste após refresh e restaura com histórico',
      async ({
        page,
      }) => {
        await page.goto('/')

        await waitForCatalog(
          page,
        )

        const pagination =
          page.getByRole(
            'navigation',
            {
              name:
                'Paginação do catálogo',
            },
          )

        await expect(
          pagination,
        ).toBeVisible()

        const pageOne =
          pagination.getByRole(
            'button',
            {
              name: '1',
              exact: true,
            },
          )

        await expect(
          pageOne,
        ).toHaveAttribute(
          'aria-current',
          'page',
        )

        /*
         * Avança para página 2.
         */
        await waitForCatalogRequest(
          page,
          {
            page: '2',
          },
          async () => {
            await pagination
              .getByRole(
                'button',
                {
                  name:
                    'Próxima página',
                },
              )
              .click()
          },
        )

        await expect
          .poll(() =>
            getUrlParam(
              page,
              'page',
            ),
          )
          .toBe('2')

        await expect(
          pagination.getByRole(
            'button',
            {
              name: '2',
              exact: true,
            },
          ),
        ).toHaveAttribute(
          'aria-current',
          'page',
        )

        /*
         * Refresh mantém
         * a página selecionada.
         */
        await page.reload()

        const paginationAfterReload =
          page.getByRole(
            'navigation',
            {
              name:
                'Paginação do catálogo',
            },
          )

        await expect(
          paginationAfterReload
            .getByRole(
              'button',
              {
                name: '2',
                exact: true,
              },
            ),
        ).toHaveAttribute(
          'aria-current',
          'page',
          {
            timeout: 10_000,
          },
        )

        await expect
          .poll(() =>
            getUrlParam(
              page,
              'page',
            ),
          )
          .toBe('2')

        /*
         * Histórico volta para
         * página 1.
         */
        await page.goBack()

        await expect
          .poll(() =>
            getUrlParam(
              page,
              'page',
            ),
          )
          .toBeNull()

        await expect(
          page
            .getByRole(
              'navigation',
              {
                name:
                  'Paginação do catálogo',
              },
            )
            .getByRole(
              'button',
              {
                name: '1',
                exact: true,
              },
            ),
        ).toHaveAttribute(
          'aria-current',
          'page',
          {
            timeout: 10_000,
          },
        )

        /*
         * Histórico avança
         * novamente para página 2.
         */
        await page.goForward()

        await expect
          .poll(() =>
            getUrlParam(
              page,
              'page',
            ),
          )
          .toBe('2')

        await expect(
          page
            .getByRole(
              'navigation',
              {
                name:
                  'Paginação do catálogo',
              },
            )
            .getByRole(
              'button',
              {
                name: '2',
                exact: true,
              },
            ),
        ).toHaveAttribute(
          'aria-current',
          'page',
          {
            timeout: 10_000,
          },
        )
      },
    )

    test(
      'combina categoria, rede, preço e ordenação e reseta a paginação',
      async ({
        page,
      }) => {
        const viewport =
          page.viewportSize()

        const isMobile =
          (
            viewport?.width ??
            1440
          ) < 1024

        /*
         * O layout atual esconde
         * FilterSidebar e ordenação
         * abaixo do breakpoint lg.
         *
         * No projeto mobile
         * validamos a reconstrução
         * do catálogo diretamente
         * pelos search params.
         */
        if (isMobile) {
          /*
           * O TanStack Router usa
           * serialização tipada.
           *
           * Como minPrice/maxPrice
           * são strings no
           * CatalogParams, usamos
           * aspas JSON codificadas
           * na URL para preservar
           * o tipo string.
           */
          const requestPromise =
            page.waitForRequest(
              (request) => {
                if (
                  request.method() !==
                    'GET' ||
                  !isCatalogRequest(
                    request.url(),
                  )
                ) {
                  return false
                }

                const url =
                  new URL(
                    request.url(),
                  )

                return (
                  url.searchParams.get(
                    'category',
                  ) ===
                    'digital-art' &&
                  url.searchParams.get(
                    'network',
                  ) ===
                    'ethereum' &&
                  url.searchParams.get(
                    'minPrice',
                  ) ===
                    '0.02' &&
                  url.searchParams.get(
                    'maxPrice',
                  ) ===
                    '12.30' &&
                  url.searchParams.get(
                    'sort',
                  ) ===
                    'price-asc' &&
                  url.searchParams.get(
                    'page',
                  ) ===
                    '1'
                )
              },
              {
                timeout: 10_000,
              },
            )

          await page.goto(
            '/?category=digital-art&network=ethereum&minPrice=%220.02%22&maxPrice=%2212.30%22&sort=price-asc',
          )

          await requestPromise

          await expect
            .poll(() =>
              getUrlParam(
                page,
                'category',
              ),
            )
            .toBe(
              'digital-art',
            )

          await expect
            .poll(() =>
              getUrlParam(
                page,
                'network',
              ),
            )
            .toBe(
              'ethereum',
            )

          await expect
            .poll(() =>
              getUrlParam(
                page,
                'minPrice',
              ),
            )
            .toBe('0.02')

          await expect
            .poll(() =>
              getUrlParam(
                page,
                'maxPrice',
              ),
            )
            .toBe('12.30')

          await expect
            .poll(() =>
              getUrlParam(
                page,
                'sort',
              ),
            )
            .toBe(
              'price-asc',
            )

          await expect(
            page.locator(
              '#catalog',
            ),
          ).toBeVisible()

          return
        }

        /*
         * DESKTOP
         *
         * Começamos na página 2
         * para provar que alterações
         * nos filtros resetam para 1.
         */
        await page.goto(
          '/?page=2',
        )

        await expect(
          page
            .getByRole(
              'navigation',
              {
                name:
                  'Paginação do catálogo',
              },
            )
            .getByRole(
              'button',
              {
                name: '2',
                exact: true,
              },
            ),
        ).toHaveAttribute(
          'aria-current',
          'page',
          {
            timeout: 10_000,
          },
        )

        /*
         * CATEGORY
         */
        const digitalArtFilter =
          page.getByRole(
            'button',
            {
              name:
                /Arte digital/,
            },
          )

        await waitForCatalogRequest(
          page,
          {
            category:
              'digital-art',
            page: '1',
          },
          async () => {
            await digitalArtFilter.click()
          },
        )

        await expect(
          digitalArtFilter,
        ).toHaveAttribute(
          'aria-pressed',
          'true',
        )

        await expect
          .poll(() =>
            getUrlParam(
              page,
              'category',
            ),
          )
          .toBe(
            'digital-art',
          )

        /*
         * page=1 é default e
         * desaparece da URL.
         */
        await expect
          .poll(() =>
            getUrlParam(
              page,
              'page',
            ),
          )
          .toBeNull()

        /*
         * NETWORK
         *
         * Precisa preservar
         * category.
         */
        const ethereumFilter =
          page.getByRole(
            'button',
            {
              name:
                /Ethereum/,
            },
          )

        await waitForCatalogRequest(
          page,
          {
            category:
              'digital-art',
            network:
              'ethereum',
            page: '1',
          },
          async () => {
            await ethereumFilter.click()
          },
        )

        await expect(
          ethereumFilter,
        ).toHaveAttribute(
          'aria-pressed',
          'true',
        )

        await expect
          .poll(() =>
            getUrlParam(
              page,
              'network',
            ),
          )
          .toBe(
            'ethereum',
          )

        await expect
          .poll(() =>
            getUrlParam(
              page,
              'category',
            ),
          )
          .toBe(
            'digital-art',
          )

        /*
         * PRICE RANGE
         *
         * Aplicamos o range atual.
         * Isso comprova combinação
         * com category + network.
         */
        const applyPriceButton =
          page.getByRole(
            'button',
            {
              name:
                'Aplicar',
              exact: true,
            },
          )

        await waitForCatalogRequest(
          page,
          {
            category:
              'digital-art',
            network:
              'ethereum',
            minPrice:
              '0.02',
            maxPrice:
              '12.30',
            page: '1',
          },
          async () => {
            await applyPriceButton.click()
          },
        )

        /*
         * Browser URL usa
         * serialização tipada.
         *
         * getUrlParam normaliza:
         *
         * "0.02" -> 0.02
         */
        await expect
          .poll(() =>
            getUrlParam(
              page,
              'minPrice',
            ),
          )
          .toBe('0.02')

        await expect
          .poll(() =>
            getUrlParam(
              page,
              'maxPrice',
            ),
          )
          .toBe('12.30')

        /*
         * SORT
         *
         * Deve preservar todos os
         * filtros anteriores.
         */
        const sortSelect =
          page.getByRole(
            'combobox',
            {
              name:
                'Ordenar NFTs',
            },
          )

        await expect(
          sortSelect,
        ).toBeVisible()

        await sortSelect.click()

        const ascendingOption =
          page.getByRole(
            'option',
            {
              name:
                'Menor preço',
            },
          )

        await expect(
          ascendingOption,
        ).toBeVisible()

        await waitForCatalogRequest(
          page,
          {
            category:
              'digital-art',
            network:
              'ethereum',
            minPrice:
              '0.02',
            maxPrice:
              '12.30',
            sort:
              'price-asc',
            page: '1',
          },
          async () => {
            await ascendingOption.click()
          },
        )

        await expect
          .poll(() =>
            getUrlParam(
              page,
              'sort',
            ),
          )
          .toBe(
            'price-asc',
          )

        /*
         * Estado final:
         * todos os filtros
         * permanecem combinados.
         */
        expect(
          getUrlParam(
            page,
            'category',
          ),
        ).toBe(
          'digital-art',
        )

        expect(
          getUrlParam(
            page,
            'network',
          ),
        ).toBe(
          'ethereum',
        )

        expect(
          getUrlParam(
            page,
            'minPrice',
          ),
        ).toBe(
          '0.02',
        )

        expect(
          getUrlParam(
            page,
            'maxPrice',
          ),
        ).toBe(
          '12.30',
        )

        expect(
          getUrlParam(
            page,
            'sort',
          ),
        ).toBe(
          'price-asc',
        )

        /*
         * page=1 é default.
         */
        expect(
          getUrlParam(
            page,
            'page',
          ),
        ).toBeNull()
      },
    )
  },
)