import type { NftNetwork } from '@/features/nft/types/nft'

export type CartItem = {
  nftId: string
  name: string
  imageUrl: string
  collection: string
  network: NftNetwork
  priceEth: string
  quantity: number
  availableQuantity: number
  version: number
}

export type CartState = {
  items: CartItem[]
}