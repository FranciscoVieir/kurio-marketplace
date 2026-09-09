import type { NftNetwork } from '@/features/nft/types/nft'

export type CatalogSort =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'newest'

export type CatalogParams = {
  search?: string
  network?: NftNetwork
  category?: string
  minPrice?: string
  maxPrice?: string
  sort?: CatalogSort
  page?: number
}