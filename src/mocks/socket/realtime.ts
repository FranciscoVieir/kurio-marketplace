import {
  getRealtimeSocket,
  type RealtimeSocket,
} from '@/services/realtime/socket'

import type {
  NftUpdatedEvent,
  OrderUpdatedEvent,
} from '@/services/realtime/events'

function emitWhenConnected(
  emit: (
    socket: RealtimeSocket,
  ) => void,
) {
  /*
   * O publisher usa o MESMO cliente
   * Socket.IO da aplicação.
   *
   * Isso continua atravessando o
   * protocolo real:
   *
   * browser socket.io-client
   * -> servidor Socket.IO
   * -> evento público
   * -> RealtimeProvider
   *
   * No deploy isso também evita
   * depender de afinidade entre duas
   * conexões WebSocket separadas em
   * instâncias diferentes da Function.
   */
  const socket =
    getRealtimeSocket()

  if (
    socket.connected
  ) {
    emit(
      socket,
    )

    return
  }

  socket.once(
    'connect',
    () => {
      emit(
        socket,
      )
    },
  )

  if (
    !socket.active
  ) {
    socket.connect()
  }
}

export function emitNftUpdated(
  event: NftUpdatedEvent,
) {
  emitWhenConnected(
    (
      socket,
    ) => {
      socket.emit(
        '__mock.nft.updated',
        event,
      )
    },
  )
}

export function emitOrderUpdated(
  event: OrderUpdatedEvent,
) {
  emitWhenConnected(
    (
      socket,
    ) => {
      socket.emit(
        '__mock.order.updated',
        {
          userId:
            event.order.userId,

          order:
            event.order,
        },
      )
    },
  )
}

export function disconnectRealtimePublisher() {
  /*
   * O publisher não possui mais uma
   * conexão própria.
   *
   * O ciclo de vida do socket
   * compartilhado pertence ao
   * RealtimeProvider, por meio de
   * disconnectRealtime().
   */
}
