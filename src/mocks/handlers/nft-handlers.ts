import { http, HttpResponse } from 'msw'
import { nftFixtures } from '@/mocks/fixtures/nfts'

const PAGE_SIZE = 2

export const nftHandlers = [
  http.get('/api/nfts', ({ request }) => {
    const url = new URL(request.url)

    const search = url.searchParams
      .get('search')
      ?.trim()
      .toLowerCase()

    const network = url.searchParams.get('network')
    const category = url.searchParams.get('category')

    const minPrice = url.searchParams.get('minPrice')
    const maxPrice = url.searchParams.get('maxPrice')

    const sort =
      url.searchParams.get('sort') ?? 'featured'

    const tab =
      url.searchParams.get('tab') ?? 'all'

    const requestedPage = Number(
      url.searchParams.get('page') ?? '1',
    )

    const page =
      Number.isInteger(requestedPage) &&
      requestedPage > 0
        ? requestedPage
        : 1

    let items = [...nftFixtures]

    /*
     * SEARCH
     */
    if (search) {
      items = items.filter((nft) => {
        const searchableText = [
          nft.name,
          nft.tokenId,
          nft.collection,
        ]
          .join(' ')
          .toLowerCase()

        return searchableText.includes(search)
      })
    }

    /*
     * NETWORK
     */
    if (network) {
      items = items.filter(
        (nft) => nft.network === network,
      )
    }

    /*
     * CATEGORY
     */
    if (category) {
      items = items.filter(
        (nft) => nft.category === category,
      )
    }

    /*
     * PRICE RANGE
     */
    if (minPrice) {
      const minimum = Number(minPrice)

      if (!Number.isNaN(minimum)) {
        items = items.filter(
          (nft) =>
            Number(nft.priceEth) >= minimum,
        )
      }
    }

    if (maxPrice) {
      const maximum = Number(maxPrice)

      if (!Number.isNaN(maximum)) {
        items = items.filter(
          (nft) =>
            Number(nft.priceEth) <= maximum,
        )
      }
    }

    /*
     * CATALOG TABS
     */
    if (tab === 'new') {
      items = [...items].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
    }

    if (tab === 'trending') {
      items = [...items]
        .filter(
          (nft) =>
            nft.trendingScore >= 80,
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
    if (sort === 'price-asc') {
      items = [...items].sort(
        (a, b) =>
          Number(a.priceEth) -
          Number(b.priceEth),
      )
    }

    if (sort === 'price-desc') {
      items = [...items].sort(
        (a, b) =>
          Number(b.priceEth) -
          Number(a.priceEth),
      )
    }

    if (sort === 'newest') {
      items = [...items].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
    }

    /*
     * PAGINATION
     */
    const total = items.length

    const startIndex =
      (page - 1) * PAGE_SIZE

    const endIndex =
      startIndex + PAGE_SIZE

    const paginatedItems =
      items.slice(startIndex, endIndex)

    return HttpResponse.json({
      items: paginatedItems,
      total,
      page,
      pageSize: PAGE_SIZE,
    })
  }),

  http.get(
    '/api/nfts/:nftId',
    ({ params }) => {
      const nft = nftFixtures.find(
        (item) =>
          item.id === params.nftId,
      )

      if (!nft) {
        return HttpResponse.json(
          {
            message: 'NFT not found',
          },
          {
            status: 404,
          },
        )
      }

      return HttpResponse.json(nft)
    },
  ),
]