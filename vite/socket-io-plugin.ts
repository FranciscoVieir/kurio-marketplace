import type {
  Plugin,
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

export function socketIoPlugin(): Plugin {
  return {
    name:
      'kurio-socket-io',

    configureServer(
      server: ViteDevServer,
    ) {
      if (
        !server.httpServer
      ) {
        return
      }

      const io =
        new Server(
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
          /*
           * O frontend autenticado
           * associa esta conexão à
           * sala daquele usuário.
           */
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

          /*
           * Estes dois eventos são
           * publicados exclusivamente
           * pela camada de mock backend.
           *
           * O servidor então converte
           * isso em eventos realtime
           * consumidos pela aplicação.
           */
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
    },
  }
}