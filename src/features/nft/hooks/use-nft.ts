import { useQuery } from '@tanstack/react-query'

import { catalogQueryKeys } from '@/features/catalog/api/catalog-query-keys'
import { getNft } from '../api/get-nft'

export function useNft(nftId: string) {
  return useQuery({
    queryKey: catalogQueryKeys.detail(nftId),
    queryFn: () => getNft(nftId),
    enabled: Boolean(nftId),
  })
}