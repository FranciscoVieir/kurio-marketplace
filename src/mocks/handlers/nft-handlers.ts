import { http, HttpResponse } from 'msw'
import { nftFixtures } from '@/mocks/fixtures/nfts'

export const nftHandlers = [
  http.get('/api/nfts', () => {
    return HttpResponse.json({
      items: nftFixtures,
      total: nftFixtures.length,
      page: 1,
      pageSize: 12,
    })
  }),

  http.get('/api/nfts/:nftId', ({ params }) => {
    const nft = nftFixtures.find((item) => item.id === params.nftId)

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
  }),
]