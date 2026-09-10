import {
  useEffect,
  type ReactNode,
} from 'react'

import {
  useQueryClient,
} from '@tanstack/react-query'

import {
  useAuth,
} from '@/features/auth/hooks/use-auth'

import {
  catalogQueryKeys,
} from '@/features/catalog/api/catalog-query-keys'

import {
  useCart,
} from '@/features/cart/hooks/use-cart'

import type {
  Nft,
} from '@/features/nft/types/nft'

import type {
  NftUpdatedEvent,
  OrderUpdatedEvent,
} from '@/services/realtime/events'

import {
  connectRealtime,
  disconnectRealtime,
} from '@/services/realtime/socket'

type RealtimeProviderProps = {
  children: ReactNode
}

export function RealtimeProvider({
  children,
}: RealtimeProviderProps) {
  const queryClient =
    useQueryClient()

  const {
    user,
    isInitializing,
  } = useAuth()

  const {
    syncNft,
  } = useCart()

  useEffect(() => {
    if (isInitializing) {
      return
    }

    const socket =
      connectRealtime()

    function bindSession() {
      if (!user) {
        return
      }

      socket.emit(
        'session.bind',
        user.id,
      )
    }

    /*
     * Sempre que o Socket.IO
     * conecta ou reconecta,
     * reconciliamos os recursos
     * ativos com a camada REST.
     *
     * Isso evita depender apenas
     * dos eventos que possam ter
     * ocorrido enquanto o cliente
     * estava desconectado.
     */
    function reconcileQueries() {
      void queryClient.invalidateQueries({
        queryKey:
          catalogQueryKeys.lists(),
      })

      void queryClient.invalidateQueries({
        predicate: (
          query,
        ) => {
          const rootKey =
            query.queryKey[0]

          return (
            rootKey ===
              'favorite-nfts' ||
            rootKey ===
              'orders' ||
            rootKey ===
              'me'
          )
        },
      })
    }

    function handleConnect() {
      bindSession()
      reconcileQueries()
    }

    function handleNftUpdated(
      event: NftUpdatedEvent,
    ) {
      /*
       * Atualiza também o snapshot
       * armazenado no carrinho.
       *
       * O próprio CartProvider
       * rejeita versões antigas ou
       * duplicadas.
       */
      syncNft(
        event.nft,
      )

      /*
       * O detalhe também protege
       * contra regressão de versão.
       */
      queryClient.setQueryData<Nft>(
        catalogQueryKeys.detail(
          event.nft.id,
        ),
        (
          currentNft,
        ) => {
          if (
            currentNft &&
            event.nft.version <=
              currentNft.version
          ) {
            return currentNft
          }

          return event.nft
        },
      )

      /*
       * As listas podem conter
       * diferentes combinações de
       * filtros, busca, ordenação
       * e paginação. Em vez de
       * tentar alterar cada cache
       * manualmente, solicitamos
       * reconciliação via REST.
       */
      void queryClient.invalidateQueries({
        queryKey:
          catalogQueryKeys.lists(),
      })

      void queryClient.invalidateQueries({
        predicate: (
          query,
        ) =>
          query.queryKey[0] ===
          'favorite-nfts',
      })
    }

    function handleOrderUpdated(
      event: OrderUpdatedEvent,
    ) {
      /*
       * Eventos privados nunca
       * podem atualizar o cache de
       * outro usuário.
       */
      if (
        !user ||
        event.order.userId !==
          user.id
      ) {
        return
      }

      queryClient.setQueryData(
        [
          'orders',
          event.order.id,
        ],
        event.order,
      )

      /*
       * Atualizamos o pedido
       * imediatamente e
       * reconciliamos os recursos
       * relacionados posteriormente
       * através da API.
       */
      void queryClient.invalidateQueries({
        predicate: (
          query,
        ) => {
          const rootKey =
            query.queryKey[0]

          return (
            rootKey ===
              'orders' ||
            rootKey ===
              'me'
          )
        },
      })
    }

    socket.on(
      'connect',
      handleConnect,
    )

    socket.on(
      'nft.updated',
      handleNftUpdated,
    )

    socket.on(
      'order.updated',
      handleOrderUpdated,
    )

    /*
     * O singleton pode já estar
     * conectado quando este efeito
     * for registrado.
     */
    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.off(
        'connect',
        handleConnect,
      )

      socket.off(
        'nft.updated',
        handleNftUpdated,
      )

      socket.off(
        'order.updated',
        handleOrderUpdated,
      )

      disconnectRealtime()
    }
  }, [
    isInitializing,
    queryClient,
    syncNft,
    user,
  ])

  return children
}