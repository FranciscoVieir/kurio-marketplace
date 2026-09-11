import {
  delay,
  http,
  HttpResponse,
} from 'msw'

import {
  isScenarioActive,
} from '@/mocks/scenarios/scenario-state'

export const favoritesHandlers = [
  http.put(
    '/api/favorites/:nftId',
    async ({
      params,
      request,
    }) => {
      await delay(250)

      const nftId =
        String(
          params.nftId,
        )

      const body: unknown =
        await request.json()

      if (
        typeof body !==
          'object' ||
        body === null ||
        typeof (
          body as {
            favorite?: unknown
          }
        ).favorite !==
          'boolean'
      ) {
        return HttpResponse.json(
          {
            code:
              'INVALID_FAVORITE_REQUEST',

            message:
              'A operação de favorito é inválida.',
          },
          {
            status: 400,
          },
        )
      }

      if (
        isScenarioActive(
          'favorite-mutation-error',
        )
      ) {
        return HttpResponse.json(
          {
            code:
              'FAVORITE_MUTATION_FAILED',

            message:
              'Não foi possível atualizar o favorito.',
          },
          {
            status: 500,
          },
        )
      }

      const {
        favorite,
      } = body as {
        favorite: boolean
      }

      return HttpResponse.json(
        {
          nftId,
          favorite,
        },
        {
          status: 200,
        },
      )
    },
  ),
]