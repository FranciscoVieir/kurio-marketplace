import type { NftNetwork } from '@/features/nft/types/nft'

export type WalletRole =
  | 'primary'
  | 'secondary'

export type WalletProvider =
  | 'metamask'
  | 'coinbase'
  | 'walletconnect'
  | 'other'

export type UserWallet = {
  id: string
  userId: string

  role: WalletRole

  displayName: string
  nickname: string

  network: NftNetwork

  profileName: string

  address: string

  secondaryAddress?: string

  provider: WalletProvider

  referralCode?: string

  email: string

  ensName?: string

  createdAt: string
  updatedAt: string
}

export type SaveWalletRequest = {
  role: WalletRole

  displayName: string
  nickname: string

  network: NftNetwork

  profileName: string

  address: string

  secondaryAddress?: string

  provider: WalletProvider

  referralCode?: string

  email: string

  ensName?: string
}