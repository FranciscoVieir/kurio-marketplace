import { api } from '@/services/api/client'

import type {
  SaveWalletRequest,
  UserWallet,
} from '../types/wallet'

export async function getWallets() {
  const response =
    await api.get<UserWallet[]>(
      '/me/wallets',
    )

  return response.data
}

export async function createWallet(
  input: SaveWalletRequest,
) {
  const response =
    await api.post<UserWallet>(
      '/me/wallets',
      input,
    )

  return response.data
}

export async function updateWallet(
  walletId: string,
  input: SaveWalletRequest,
) {
  const response =
    await api.patch<UserWallet>(
      `/me/wallets/${walletId}`,
      input,
    )

  return response.data
}

export async function deleteWallet(
  walletId: string,
) {
  await api.delete(
    `/me/wallets/${walletId}`,
  )
}