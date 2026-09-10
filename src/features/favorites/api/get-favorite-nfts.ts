import { api } from '@/services/api/client'

import type { Nft } from '@/features/nft/types/nft'

export async function getFavoriteNfts(
  favoriteIds: string[],
) {
  if (favoriteIds.length === 0) {
    return []
  }

  const responses =
    await Promise.all(
      favoriteIds.map(
        (nftId) =>
          api.get<Nft>(
            `/nfts/${nftId}`,
          ),
      ),
    )

  return responses.map(
    (response) =>
      response.data,
  )
}