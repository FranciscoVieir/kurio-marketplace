import {
  io,
  type Socket,
} from 'socket.io-client'

import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from './events'

type KurioSocket =
  Socket<
    ServerToClientEvents,
    ClientToServerEvents
  >

let socket:
  | KurioSocket
  | null = null

export function getRealtimeSocket() {
  if (socket) {
    return socket
  }

  socket = io(
    window.location.origin,
    {
      path:
        '/socket.io/',

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

  return socket
}

export function connectRealtime() {
  const realtimeSocket =
    getRealtimeSocket()

  if (
    !realtimeSocket.connected &&
    !realtimeSocket.active
  ) {
    realtimeSocket.connect()
  }

  return realtimeSocket
}

export function disconnectRealtime() {
  if (!socket) {
    return
  }

  socket.disconnect()

  socket = null
}