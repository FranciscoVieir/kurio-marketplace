import { useQuery } from '@tanstack/react-query'

import { getNfts } from '../api/get-nfts'

import { catalogQueryKeys } from '../api/catalog-query-keys'

import type { CatalogParams } from '../types/catalog'

export function useNfts(params: CatalogParams = {}) {
  return useQuery({
    queryKey: catalogQueryKeys.list(params),
    queryFn: () => getNfts(params),
  })
}