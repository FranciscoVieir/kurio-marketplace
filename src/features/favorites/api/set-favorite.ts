import {
  api,
} from '@/services/api/client'

type SetFavoriteRequest = {
  favorite: boolean
}

export async function setFavorite(
  nftId: string,
  favorite: boolean,
) {
  await api.put(
    `/favorites/${nftId}`,
    {
      favorite,
    } satisfies SetFavoriteRequest,
  )
}