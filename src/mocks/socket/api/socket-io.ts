import {
  createServer,
} from 'node:http'

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

/*
 * Vercel Functions com Fluid Compute
 * suportam WebSockets.
 *
 * A própria Function é montada em:
 *
 *   /api/socket-io
 *
 * O Socket.IO acrescenta o path padrão:
 *
 *   /socket.io
 *
 * Portanto, no deploy o cliente utiliza:
 *
 *   /api/socket-io/socket.io
 */
const server =
  createServer()

const io =
  new Server(
    server,
    {
      cors: {
        origin: true,
        credentials: true,
      },
    },
  )

io.on(
  'connection',
  (
    socket,
  ) => {
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
        payload:
          NftUpdatedPayload,
      ) => {
        if (
          !payload ||
          !(
            'nft' in
            payload
          )
        ) {
          return
        }

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
        payload:
          OrderUpdatedPayload,
      ) => {
        if (
          !payload ||
          typeof payload.userId !==
            'string' ||
          !payload.userId.trim()
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

export default server
