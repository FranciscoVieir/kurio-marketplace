import type { NftNetwork } from '@/features/nft/types/nft'

export type CheckoutQuoteItemInput = {
  nftId: string
  quantity: number
  version: number
}

export type CheckoutQuoteRequest = {
  items: CheckoutQuoteItemInput[]
  couponCode?: string
}

export type CheckoutQuoteItem = {
  nftId: string
  name: string
  tokenId: string
  imageUrl: string
  quantity: number
  unitPriceEth: string
  subtotalEth: string
  availableQuantity: number
  version: number
}

export type CheckoutQuote = {
  quoteId: string
  items: CheckoutQuoteItem[]
  network: NftNetwork
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
  expiresAt: string
}

export type CollectorProfileInput = {
  displayName: string
  username: string
  network: NftNetwork
  profileName: string
  walletAddress: string
  secondaryWallet?: string
  walletType: string
  referralCode?: string
  email: string
  ensName?: string
  useAnotherWallet: boolean
  collectionNote?: string
}

export type CheckoutWalletProvider =
  | 'metamask'
  | 'coinbase'

export type CreateOrderRequest = {
  quoteId: string
  profile: CollectorProfileInput
  walletProvider: CheckoutWalletProvider
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'failed'

export type Order = {
  id: string

  /*
   * Dono do pedido.
   *
   * Nunca vem do formulário do cliente.
   * É definido pela sessão autenticada
   * no handler do backend mock.
   */
  userId: string

  quoteId: string
  transactionHash: string
  status: OrderStatus

  /*
   * Versão monotônica do recurso.
   *
   * Cada alteração persistida no pedido
   * incrementa este número. O cliente usa
   * a versão para ignorar eventos realtime
   * duplicados ou antigos.
   */
  version: number

  items: CheckoutQuoteItem[]
  network: NftNetwork
  walletProvider: CheckoutWalletProvider
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
  createdAt: string
}
