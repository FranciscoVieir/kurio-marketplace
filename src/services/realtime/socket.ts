import {
  io,
  type Socket,
} from 'socket.io-client'

import type {
  NftUpdatedEvent,
  OrderUpdatedEvent,
} from './events'

type ServerToClientEvents = {
  'nft.updated': (
    event: NftUpdatedEvent,
  ) => void

  'order.updated': (
    event: OrderUpdatedEvent,
  ) => void
}

type ClientToServerEvents = {
  'session.bind': (
    userId: string,
  ) => void

  '__mock.nft.updated': (
    event: NftUpdatedEvent,
  ) => void

  '__mock.order.updated': (
    payload: {
      userId: string
      order:
        OrderUpdatedEvent['order']
    },
  ) => void
}

export type RealtimeSocket =
  Socket<
    ServerToClientEvents,
    ClientToServerEvents
  >

let realtimeSocket:
  | RealtimeSocket
  | null = null

function isLocalRuntime() {
  const hostname =
    window.location.hostname

  return (
    hostname ===
      'localhost' ||
    hostname ===
      '127.0.0.1' ||
    hostname ===
      '0.0.0.0' ||
    hostname ===
      '::1' ||
    hostname ===
      '[::1]'
  )
}

function getRealtimePath() {
  /*
   * Desenvolvimento, preview local
   * e Playwright usam o servidor
   * Socket.IO acoplado ao Vite.
   */
  if (
    isLocalRuntime()
  ) {
    return '/socket.io/'
  }

  /*
   * No deploy da Vercel o servidor
   * Socket.IO vive na Function:
   *
   *   api/socket-io.ts
   *
   * A Function é montada em
   * /api/socket-io e o Socket.IO
   * acrescenta /socket.io.
   */
  return '/api/socket-io/socket.io'
}

export function getRealtimeSocket() {
  if (
    realtimeSocket
  ) {
    return realtimeSocket
  }

  realtimeSocket =
    io(
      window.location.origin,
      {
        path:
          getRealtimePath(),

        transports: [
          'websocket',
        ],

        autoConnect:
          false,

        reconnection:
          true,

        reconnectionAttempts:
          5,

        reconnectionDelay:
          1000,
      },
    )

  return realtimeSocket
}

export function connectRealtime() {
  const socket =
    getRealtimeSocket()

  if (
    !socket.connected
  ) {
    socket.connect()
  }

  return socket
}

export function disconnectRealtime() {
  if (
    !realtimeSocket
  ) {
    return
  }

  realtimeSocket.disconnect()
  realtimeSocket = null
}
