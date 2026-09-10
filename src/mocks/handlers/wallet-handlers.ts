import {
  http,
  HttpResponse,
} from 'msw'

import type {
  SaveWalletRequest,
  WalletProvider,
  WalletRole,
} from '@/features/wallets/types/wallet'

import {
  createWallet,
  deleteWallet,
  getWalletByRole,
  getWalletForUser,
  getWalletsByUserId,
  updateWallet,
} from '@/mocks/database/wallets'

import {
  deleteSession,
  getActiveSession,
  isSessionExpired,
} from '@/mocks/database/sessions'

import {
  getUserById,
} from '@/mocks/database/users'

const allowedRoles: WalletRole[] = [
  'primary',
  'secondary',
]

const allowedProviders: WalletProvider[] = [
  'metamask',
  'coinbase',
  'walletconnect',
  'other',
]

const allowedNetworks = [
  'ethereum',
  'polygon',
  'solana',
] as const

function getAuthenticatedUserId() {
  const session =
    getActiveSession()

  if (!session) {
    return {
      ok: false as const,

      response:
        HttpResponse.json(
          {
            code:
              'UNAUTHENTICATED',

            message:
              'Você precisa estar autenticado para acessar suas carteiras.',
          },
          {
            status: 401,
          },
        ),
    }
  }

  if (
    isSessionExpired(
      session,
    )
  ) {
    deleteSession(
      session.id,
    )

    return {
      ok: false as const,

      response:
        HttpResponse.json(
          {
            code:
              'SESSION_EXPIRED',

            message:
              'Sua sessão expirou. Entre novamente para continuar.',
          },
          {
            status: 401,
          },
        ),
    }
  }

  const user =
    getUserById(
      session.userId,
    )

  if (!user) {
    deleteSession(
      session.id,
    )

    return {
      ok: false as const,

      response:
        HttpResponse.json(
          {
            code:
              'INVALID_SESSION',

            message:
              'A sessão atual não está associada a um usuário válido.',
          },
          {
            status: 401,
          },
        ),
    }
  }

  return {
    ok: true as const,

    userId:
      user.id,
  }
}

function isWalletRole(
  value: unknown,
): value is WalletRole {
  return (
    typeof value ===
      'string' &&
    allowedRoles.includes(
      value as WalletRole,
    )
  )
}

function isWalletProvider(
  value: unknown,
): value is WalletProvider {
  return (
    typeof value ===
      'string' &&
    allowedProviders.includes(
      value as WalletProvider,
    )
  )
}

function isNetwork(
  value: unknown,
): value is SaveWalletRequest['network'] {
  return (
    typeof value ===
      'string' &&
    allowedNetworks.includes(
      value as (
        typeof allowedNetworks
      )[number],
    )
  )
}

function isOptionalString(
  value: unknown,
) {
  return (
    value === undefined ||
    typeof value ===
      'string'
  )
}

function isSaveWalletRequest(
  value: unknown,
): value is SaveWalletRequest {
  if (
    typeof value !==
      'object' ||
    value === null
  ) {
    return false
  }

  const wallet =
    value as Record<
      string,
      unknown
    >

  return (
    isWalletRole(
      wallet.role,
    ) &&

    typeof wallet.displayName ===
      'string' &&
    Boolean(
      wallet.displayName.trim(),
    ) &&

    typeof wallet.nickname ===
      'string' &&
    Boolean(
      wallet.nickname.trim(),
    ) &&

    isNetwork(
      wallet.network,
    ) &&

    typeof wallet.profileName ===
      'string' &&
    Boolean(
      wallet.profileName.trim(),
    ) &&

    typeof wallet.address ===
      'string' &&
    Boolean(
      wallet.address.trim(),
    ) &&

    isOptionalString(
      wallet.secondaryAddress,
    ) &&

    isWalletProvider(
      wallet.provider,
    ) &&

    isOptionalString(
      wallet.referralCode,
    ) &&

    typeof wallet.email ===
      'string' &&
    Boolean(
      wallet.email.trim(),
    ) &&

    isOptionalString(
      wallet.ensName,
    )
  )
}

export const walletHandlers = [
  /*
   * Lista somente as carteiras
   * pertencentes à sessão atual.
   */
  http.get(
    '/api/me/wallets',
    () => {
      const auth =
        getAuthenticatedUserId()

      if (!auth.ok) {
        return auth.response
      }

      const wallets =
        getWalletsByUserId(
          auth.userId,
        )

      return HttpResponse.json(
        wallets,
        {
          status: 200,
        },
      )
    },
  ),

  /*
   * Cria uma carteira para
   * o usuário autenticado.
   */
  http.post(
    '/api/me/wallets',
    async ({
      request,
    }) => {
      const auth =
        getAuthenticatedUserId()

      if (!auth.ok) {
        return auth.response
      }

      const body: unknown =
        await request.json()

      if (
        !isSaveWalletRequest(
          body,
        )
      ) {
        return HttpResponse.json(
          {
            code:
              'INVALID_WALLET_REQUEST',

            message:
              'Os dados enviados para a carteira são inválidos.',
          },
          {
            status: 400,
          },
        )
      }

      /*
       * O Figma trabalha com uma
       * principal e uma secundária.
       *
       * Impedimos duplicação do mesmo
       * papel também no backend mock.
       */
      const existingWallet =
        getWalletByRole(
          auth.userId,
          body.role,
        )

      if (existingWallet) {
        return HttpResponse.json(
          {
            code:
              'WALLET_ROLE_ALREADY_EXISTS',

            message:
              body.role ===
              'primary'
                ? 'Você já possui uma carteira principal.'
                : 'Você já possui uma carteira secundária.',
          },
          {
            status: 409,
          },
        )
      }

      const wallet =
        createWallet(
          auth.userId,
          body,
        )

      return HttpResponse.json(
        wallet,
        {
          status: 201,
        },
      )
    },
  ),

  /*
   * Atualiza uma carteira existente.
   *
   * Uma carteira de outro usuário
   * se comporta como inexistente.
   */
  http.patch(
    '/api/me/wallets/:walletId',
    async ({
      params,
      request,
    }) => {
      const auth =
        getAuthenticatedUserId()

      if (!auth.ok) {
        return auth.response
      }

      const walletId =
        String(
          params.walletId,
        )

      const currentWallet =
        getWalletForUser(
          walletId,
          auth.userId,
        )

      if (!currentWallet) {
        return HttpResponse.json(
          {
            code:
              'WALLET_NOT_FOUND',

            message:
              'Carteira não encontrada.',
          },
          {
            status: 404,
          },
        )
      }

      const body: unknown =
        await request.json()

      if (
        !isSaveWalletRequest(
          body,
        )
      ) {
        return HttpResponse.json(
          {
            code:
              'INVALID_WALLET_REQUEST',

            message:
              'Os dados enviados para a carteira são inválidos.',
          },
          {
            status: 400,
          },
        )
      }

      /*
       * Caso o role esteja sendo
       * alterado, não podemos deixar
       * duas primary ou duas secondary.
       */
      if (
        body.role !==
        currentWallet.role
      ) {
        const walletWithRole =
          getWalletByRole(
            auth.userId,
            body.role,
          )

        if (
          walletWithRole &&
          walletWithRole.id !==
            currentWallet.id
        ) {
          return HttpResponse.json(
            {
              code:
                'WALLET_ROLE_ALREADY_EXISTS',

              message:
                body.role ===
                'primary'
                  ? 'Você já possui uma carteira principal.'
                  : 'Você já possui uma carteira secundária.',
            },
            {
              status: 409,
            },
          )
        }
      }

      const wallet =
        updateWallet(
          walletId,
          auth.userId,
          body,
        )

      if (!wallet) {
        return HttpResponse.json(
          {
            code:
              'WALLET_NOT_FOUND',

            message:
              'Carteira não encontrada.',
          },
          {
            status: 404,
          },
        )
      }

      return HttpResponse.json(
        wallet,
        {
          status: 200,
        },
      )
    },
  ),

  /*
   * Remove apenas uma carteira
   * pertencente à conta atual.
   */
  http.delete(
    '/api/me/wallets/:walletId',
    ({
      params,
    }) => {
      const auth =
        getAuthenticatedUserId()

      if (!auth.ok) {
        return auth.response
      }

      const walletId =
        String(
          params.walletId,
        )

      const deleted =
        deleteWallet(
          walletId,
          auth.userId,
        )

      if (!deleted) {
        return HttpResponse.json(
          {
            code:
              'WALLET_NOT_FOUND',

            message:
              'Carteira não encontrada.',
          },
          {
            status: 404,
          },
        )
      }

      return new HttpResponse(
        null,
        {
          status: 204,
        },
      )
    },
  ),
]