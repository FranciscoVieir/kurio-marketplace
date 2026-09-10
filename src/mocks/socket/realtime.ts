import {
  io,
  type Socket,
} from 'socket.io-client'

import type {
  NftUpdatedEvent,
  OrderUpdatedEvent,
} from '@/services/realtime/events'

type MockPublisherEvents = {
  '__mock.nft.updated': (
    payload: NftUpdatedEvent,
  ) => void

  '__mock.order.updated': (
    payload: {
      userId: string
      order: OrderUpdatedEvent['order']
    },
  ) => void
}

type MockPublisherSocket =
  Socket<
    Record<string, never>,
    MockPublisherEvents
  >

let publisherSocket:
  | MockPublisherSocket
  | null = null

function getPublisherSocket() {
  if (
    publisherSocket
  ) {
    return publisherSocket
  }

  publisherSocket = io(
    window.location.origin,
    {
      path: '/socket.io/',
      transports: [
        'websocket',
      ],
      autoConnect: true,
      reconnection: true,
    },
  )

  return publisherSocket
}

function emitWhenConnected(
  emit: (
    socket: MockPublisherSocket,
  ) => void,
) {
  const socket =
    getPublisherSocket()

  if (
    socket.connected
  ) {
    emit(socket)
    return
  }

  socket.once(
    'connect',
    () => {
      emit(socket)
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
    (socket) => {
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
    (socket) => {
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
  if (
    !publisherSocket
  ) {
    return
  }

  publisherSocket.disconnect()
  publisherSocket = null
}