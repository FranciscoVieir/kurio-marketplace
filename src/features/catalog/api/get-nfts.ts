import { api } from '@/services/api/client'
import type { Nft } from '@/features/nft/types/nft'
import type { CatalogParams } from '../types/catalog'

export type GetNftsResponse = {
  items: Nft[]
  total: number
  page: number
  pageSize: number
}

export async function getNfts(params: CatalogParams) {
  const response = await api.get<GetNftsResponse>('/nfts', {
    params,
  })

  return response.data
}