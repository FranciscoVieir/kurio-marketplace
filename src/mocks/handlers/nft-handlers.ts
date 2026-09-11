import {
  delay,
  http,
  HttpResponse,
} from 'msw'

import {
  getNftById,
  getNfts,
} from '@/mocks/database/nft-database'

import {
  isScenarioActive,
  shouldFailCatalogRequest,
} from '@/mocks/scenarios/scenario-state'

const PAGE_SIZE = 9

const CATALOG_DELAY_MS =
  800

const CATALOG_SLOW_DELAY_MS =
  2_000

export const nftHandlers = [
  http.get(
    '/api/nfts',
    async ({ request }) => {
      /*
       * SLOW CATALOG
       *
       * Mantemos o delay normal da
       * aplicação intacto e aumentamos
       * apenas no cenário determinístico
       * usado pelo E2E.
       *
       * Isso permite verificar que o
       * skeleton permanece visível
       * enquanto a consulta está pendente.
       */
      await delay(
        isScenarioActive(
          'catalog-slow',
        )
          ? CATALOG_SLOW_DELAY_MS
          : CATALOG_DELAY_MS,
      )

      /*
       * TRANSIENT CATALOG FAILURE
       *
       * O QueryClient está configurado com:
       *
       * retry: 1
       *
       * shouldFailCatalogRequest()
       * devolve true somente para as
       * duas primeiras requisições após
       * a ativação do cenário.
       *
       * Fluxo esperado:
       *
       * 1ª request -> 503
       * retry automático -> 503
       * UI -> estado de erro
       * retry manual -> sucesso
       */
      if (
        shouldFailCatalogRequest()
      ) {
        return HttpResponse.json(
          {
            code:
              'CATALOG_TEMPORARILY_UNAVAILABLE',

            message:
              'O catálogo está temporariamente indisponível. Tente novamente.',
          },
          {
            status: 503,
          },
        )
      }

      const url =
        new URL(request.url)

      const search =
        url.searchParams
          .get('search')
          ?.trim()
          .toLowerCase()

      const network =
        url.searchParams.get(
          'network',
        )

      const category =
        url.searchParams.get(
          'category',
        )

      const minPrice =
        url.searchParams.get(
          'minPrice',
        )

      const maxPrice =
        url.searchParams.get(
          'maxPrice',
        )

      const sort =
        url.searchParams.get(
          'sort',
        ) ?? 'featured'

      const tab =
        url.searchParams.get(
          'tab',
        ) ?? 'all'

      const requestedPage =
        Number(
          url.searchParams.get(
            'page',
          ) ?? '1',
        )

      const page =
        Number.isInteger(
          requestedPage,
        ) &&
        requestedPage > 0
          ? requestedPage
          : 1

      let items = [
        ...getNfts(),
      ]

      /*
       * SEARCH
       */
      if (search) {
        items =
          items.filter((nft) => {
            const searchableText = [
              nft.name,
              nft.tokenId,
              nft.collection,
            ]
              .join(' ')
              .toLowerCase()

            return searchableText.includes(
              search,
            )
          })
      }

      /*
       * NETWORK
       */
      if (network) {
        items =
          items.filter(
            (nft) =>
              nft.network ===
              network,
          )
      }

      /*
       * CATEGORY
       */
      if (category) {
        items =
          items.filter(
            (nft) =>
              nft.category ===
              category,
          )
      }

      /*
       * PRICE RANGE
       */
      if (minPrice) {
        const minimum =
          Number(minPrice)

        if (
          !Number.isNaN(
            minimum,
          )
        ) {
          items =
            items.filter(
              (nft) =>
                Number(
                  nft.priceEth,
                ) >= minimum,
            )
        }
      }

      if (maxPrice) {
        const maximum =
          Number(maxPrice)

        if (
          !Number.isNaN(
            maximum,
          )
        ) {
          items =
            items.filter(
              (nft) =>
                Number(
                  nft.priceEth,
                ) <= maximum,
            )
        }
      }

      /*
       * CATALOG TABS
       */
      if (tab === 'new') {
        items = [
          ...items,
        ].sort(
          (a, b) =>
            new Date(
              b.createdAt,
            ).getTime() -
            new Date(
              a.createdAt,
            ).getTime(),
        )
      }

      if (
        tab === 'trending'
      ) {
        items = [
          ...items,
        ]
          .filter(
            (nft) =>
              nft.trendingScore >=
              80,
          )
          .sort(
            (a, b) =>
              b.trendingScore -
              a.trendingScore,
          )
      }

      /*
       * SORT
       */
      if (
        sort === 'price-asc'
      ) {
        items = [
          ...items,
        ].sort(
          (a, b) =>
            Number(
              a.priceEth,
            ) -
            Number(
              b.priceEth,
            ),
        )
      }

      if (
        sort === 'price-desc'
      ) {
        items = [
          ...items,
        ].sort(
          (a, b) =>
            Number(
              b.priceEth,
            ) -
            Number(
              a.priceEth,
            ),
        )
      }

      if (
        sort === 'newest'
      ) {
        items = [
          ...items,
        ].sort(
          (a, b) =>
            new Date(
              b.createdAt,
            ).getTime() -
            new Date(
              a.createdAt,
            ).getTime(),
        )
      }

      /*
       * PAGINATION
       */
      const total =
        items.length

      const startIndex =
        (page - 1) *
        PAGE_SIZE

      const endIndex =
        startIndex +
        PAGE_SIZE

      const paginatedItems =
        items.slice(
          startIndex,
          endIndex,
        )

      return HttpResponse.json({
        items:
          paginatedItems,
        total,
        page,
        pageSize:
          PAGE_SIZE,
      })
    },
  ),

  http.get(
    '/api/nfts/:nftId',
    ({ params }) => {
      const nftId =
        String(
          params.nftId,
        )

      const nft =
        getNftById(nftId)

      if (!nft) {
        return HttpResponse.json(
          {
            code:
              'NFT_NOT_FOUND',

            message:
              'NFT não encontrado.',
          },
          {
            status: 404,
          },
        )
      }

      return HttpResponse.json(
        nft,
        {
          status: 200,
        },
      )
    },
  ),
]