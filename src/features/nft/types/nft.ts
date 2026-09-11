export type NftNetwork =
  | 'ethereum'
  | 'polygon'
  | 'solana'

export type Nft = {
  id: string

  name: string

  tokenId: string

  priceEth: string

  previousPriceEth?: string

  imageUrl: string

  collection: string

  network: NftNetwork

  category: string

  availableQuantity: number

  version: number

  createdAt: string

  trendingScore: number

  // Dados adicionais da tela de detalhes
  description?: string

  rating?: number

  reviewCount?: number

  edition?: {
    current: number
    total: number
    collectionCurrent?: number
    collectionTotal?: number
    rarityCurrent?: number
    rarityTotal?: number
    status?: 'open' | 'closed'
  }

  attributes?: string[]
}