import type {
  Plugin,
  PreviewServer,
  ViteDevServer,
} from 'vite'

import {
  Server,
} from 'socket.io'

type OrderUpdatedPayload = {
  userId: string
  order: unknown
}

type NftUpdatedPayload = {
  nft: unknown
}

type ViteServer =
  | ViteDevServer
  | PreviewServer

function attachSocketIo(
  server: ViteServer,
) {
  if (!server.httpServer) {
    return
  }

  const io = new Server(
    server.httpServer,
    {
      path:
        '/socket.io/',

      cors: {
        origin: true,
        credentials: true,
      },
    },
  )

  io.on(
    'connection',
    (socket) => {
      socket.on(
        'session.bind',
        (
          userId: unknown,
        ) => {
          if (
            typeof userId !==
              'string' ||
            !userId.trim()
          ) {
            return
          }

          void socket.join(
            `user:${userId}`,
          )
        },
      )

      socket.on(
        '__mock.nft.updated',
        (
          payload: NftUpdatedPayload,
        ) => {
          io.emit(
            'nft.updated',
            {
              nft:
                payload.nft,
            },
          )
        },
      )

      socket.on(
        '__mock.order.updated',
        (
          payload: OrderUpdatedPayload,
        ) => {
          if (
            typeof payload?.userId !==
              'string'
          ) {
            return
          }

          io
            .to(
              `user:${payload.userId}`,
            )
            .emit(
              'order.updated',
              {
                order:
                  payload.order,
              },
            )
        },
      )
    },
  )
}

export function socketIoPlugin(): Plugin {
  return {
    name:
      'kurio-socket-io',

    configureServer(
      server,
    ) {
      attachSocketIo(
        server,
      )
    },

    configurePreviewServer(
      server,
    ) {
      attachSocketIo(
        server,
      )
    },
  }
}