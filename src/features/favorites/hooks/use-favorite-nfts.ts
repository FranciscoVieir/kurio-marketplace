import {
  useQuery,
} from '@tanstack/react-query'

import {
  getFavoriteNfts,
} from '../api/get-favorite-nfts'

export const favoriteNftsQueryKeys = {
  list: (
    favoriteIds: string[],
  ) =>
    [
      'favorite-nfts',
      ...favoriteIds,
    ] as const,
}

export function useFavoriteNfts(
  favoriteIds: string[],
) {
  return useQuery({
    queryKey:
      favoriteNftsQueryKeys.list(
        favoriteIds,
      ),

    queryFn: () =>
      getFavoriteNfts(
        favoriteIds,
      ),

    enabled:
      favoriteIds.length >
      0,
  })
}