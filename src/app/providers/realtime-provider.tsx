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

    function handleNftUpdated(
      event: NftUpdatedEvent,
    ) {
      queryClient.setQueryData(
        catalogQueryKeys.detail(
          event.nft.id,
        ),
        event.nft,
      )

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
      bindSession,
    )

    socket.on(
      'nft.updated',
      handleNftUpdated,
    )

    socket.on(
      'order.updated',
      handleOrderUpdated,
    )

    if (socket.connected) {
      bindSession()
    }

    return () => {
      socket.off(
        'connect',
        bindSession,
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
    user,
  ])

  return children
}