import { api } from '@/services/api/client'
import type { Nft } from '@/mocks/fixtures/nfts'

type GetNftsResponse = {
  items: Nft[]
  total: number
  page: number
  pageSize: number
}

export async function getNfts() {
  const response = await api.get<GetNftsResponse>('/nfts')

  return response.data
}