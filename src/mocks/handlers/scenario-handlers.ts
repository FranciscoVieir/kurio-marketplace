import {
  http,
  HttpResponse,
} from 'msw'

import {
  getNftById,
  updateNft,
} from '@/mocks/database/nft-database'

import {
  expireActiveSession,
} from '@/mocks/database/sessions'

import {
  emitNftUpdated,
} from '@/mocks/socket/realtime'

import {
  getActiveScenario,
  resetActiveScenario,
  setActiveScenario,
  type MockScenario,
} from '@/mocks/scenarios/scenario-state'

function isMockScenario(
  value: unknown,
): value is MockScenario {
  return (
    value === 'default' ||
    value === 'quote-expired' ||
    value === 'insufficient-stock' ||
    value === 'nft-price-changed' ||
    value === 'nft-version-changed' ||
    value === 'session-expired' ||
    value ===
      'favorite-mutation-error' ||
    value ===
      'payment-refused' ||
    value ===
      'payment-timeout'
  )
}

type RealtimeNftUpdateRequest = {
  nftId?: unknown
  priceEth?: unknown
  availableQuantity?: unknown
}

export const scenarioHandlers = [
  http.get(
    '/api/__mock/scenario',
    () =>
      HttpResponse.json(
        {
          scenario:
            getActiveScenario(),
        },
        {
          status: 200,
        },
      ),
  ),

  http.post(
    '/api/__mock/scenario',
    async ({
      request,
    }) => {
      const body: unknown =
        await request.json()

      if (
        typeof body !==
          'object' ||
        body === null
      ) {
        return HttpResponse.json(
          {
            code:
              'INVALID_SCENARIO_REQUEST',

            message:
              'O cenário informado é inválido.',
          },
          {
            status: 400,
          },
        )
      }

      const {
        scenario,
      } = body as {
        scenario?: unknown
      }

      if (
        !isMockScenario(
          scenario,
        )
      ) {
        return HttpResponse.json(
          {
            code:
              'INVALID_SCENARIO',

            message:
              'O cenário informado não existe.',

            allowedScenarios: [
              'default',
              'quote-expired',
              'insufficient-stock',
              'nft-price-changed',
              'nft-version-changed',
              'session-expired',
              'favorite-mutation-error',
              'payment-refused',
              'payment-timeout',
            ],
          },
          {
            status: 400,
          },
        )
      }

      setActiveScenario(
        scenario,
      )

      if (
        scenario ===
        'session-expired'
      ) {
        const expiredSession =
          expireActiveSession()

        if (
          !expiredSession
        ) {
          return HttpResponse.json(
            {
              code:
                'NO_ACTIVE_SESSION',

              message:
                'Não existe uma sessão ativa para expirar.',
            },
            {
              status: 409,
            },
          )
        }
      }

      return HttpResponse.json(
        {
          scenario:
            getActiveScenario(),
        },
        {
          status: 200,
        },
      )
    },
  ),

  /*
   * MOCK REALTIME NFT UPDATE
   *
   * Representa uma alteração externa
   * ocorrendo no marketplace enquanto
   * o usuário está navegando.
   *
   * O estado é persistido primeiro e
   * somente depois o evento nft.updated
   * é publicado pelo Socket.IO.
   */
  http.post(
    '/api/__mock/realtime/nft',
    async ({
      request,
    }) => {
      const body: unknown =
        await request.json()

      if (
        typeof body !==
          'object' ||
        body === null
      ) {
        return HttpResponse.json(
          {
            code:
              'INVALID_REALTIME_UPDATE',

            message:
              'A atualização realtime informada é inválida.',
          },
          {
            status: 400,
          },
        )
      }

      const {
        nftId,
        priceEth,
        availableQuantity,
      } =
        body as RealtimeNftUpdateRequest

      if (
        typeof nftId !==
          'string' ||
        !nftId.trim()
      ) {
        return HttpResponse.json(
          {
            code:
              'NFT_ID_REQUIRED',

            message:
              'O NFT é obrigatório.',
          },
          {
            status: 400,
          },
        )
      }

      const currentNft =
        getNftById(
          nftId,
        )

      if (!currentNft) {
        return HttpResponse.json(
          {
            code:
              'NFT_NOT_FOUND',

            message:
              'NFT não encontrado.',
          },
          {
            status: 404,
          },
        )
      }

      const hasPriceUpdate =
        priceEth !== undefined

      const hasAvailabilityUpdate =
        availableQuantity !==
        undefined

      if (
        !hasPriceUpdate &&
        !hasAvailabilityUpdate
      ) {
        return HttpResponse.json(
          {
            code:
              'NO_NFT_CHANGES',

            message:
              'Informe preço ou disponibilidade para atualizar.',
          },
          {
            status: 400,
          },
        )
      }

      if (
        hasPriceUpdate &&
        (
          typeof priceEth !==
            'string' ||
          !priceEth.trim() ||
          !Number.isFinite(
            Number(priceEth),
          ) ||
          Number(priceEth) < 0
        )
      ) {
        return HttpResponse.json(
          {
            code:
              'INVALID_NFT_PRICE',

            message:
              'O preço informado é inválido.',
          },
          {
            status: 400,
          },
        )
      }

      if (
        hasAvailabilityUpdate &&
        (
          typeof availableQuantity !==
            'number' ||
          !Number.isInteger(
            availableQuantity,
          ) ||
          availableQuantity < 0
        )
      ) {
        return HttpResponse.json(
          {
            code:
              'INVALID_NFT_AVAILABILITY',

            message:
              'A disponibilidade informada é inválida.',
          },
          {
            status: 400,
          },
        )
      }

      const updatedNft =
        updateNft(
          currentNft.id,
          {
            ...(hasPriceUpdate
              ? {
                  priceEth:
                    priceEth as string,
                }
              : {}),

            ...(hasAvailabilityUpdate
              ? {
                  availableQuantity:
                    availableQuantity as number,
                }
              : {}),

            /*
             * Toda alteração realtime real
             * gera um snapshot mais novo.
             *
             * Isso é essencial porque o
             * cliente descarta eventos com
             * version <= versão atual.
             */
            version:
              currentNft.version +
              1,
          },
        )

      if (!updatedNft) {
        return HttpResponse.json(
          {
            code:
              'NFT_UPDATE_FAILED',

            message:
              'Não foi possível atualizar o NFT.',
          },
          {
            status: 500,
          },
        )
      }

      /*
       * Importante:
       *
       * não manipulamos React Query nem
       * CartContext diretamente.
       *
       * A interface só conhece a alteração
       * quando nft.updated percorre o
       * Socket.IO normal da aplicação.
       */
      emitNftUpdated({
        nft:
          updatedNft,
      })

      return HttpResponse.json(
        {
          nft:
            updatedNft,
        },
        {
          status: 200,
        },
      )
    },
  ),

  http.delete(
    '/api/__mock/scenario',
    () => {
      resetActiveScenario()

      return HttpResponse.json(
        {
          scenario:
            getActiveScenario(),
        },
        {
          status: 200,
        },
      )
    },
  ),
]