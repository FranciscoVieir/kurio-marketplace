import { api } from '@/services/api/client'
import type { Nft } from '../types/nft'

export async function getNft(nftId: string) {
  const response = await api.get<Nft>(
    `/nfts/${nftId}`,
  )

  return response.data
}