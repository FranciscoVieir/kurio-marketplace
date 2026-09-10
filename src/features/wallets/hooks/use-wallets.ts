import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createWallet,
  deleteWallet,
  getWallets,
  updateWallet,
} from '../api/wallets'

import type {
  SaveWalletRequest,
} from '../types/wallet'

export const walletQueryKeys = {
  all: [
    'wallets',
  ] as const,
}

export function useWallets() {
  return useQuery({
    queryKey:
      walletQueryKeys.all,

    queryFn:
      getWallets,
  })
}

type SaveWalletVariables = {
  walletId?: string
  input: SaveWalletRequest
}

export function useSaveWallet() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      walletId,
      input,
    }: SaveWalletVariables) => {
      if (walletId) {
        return updateWallet(
          walletId,
          input,
        )
      }

      return createWallet(
        input,
      )
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          walletQueryKeys.all,
      })
    },
  })
}

export function useDeleteWallet() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn:
      deleteWallet,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          walletQueryKeys.all,
      })
    },
  })
}