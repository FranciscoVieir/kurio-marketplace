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
}