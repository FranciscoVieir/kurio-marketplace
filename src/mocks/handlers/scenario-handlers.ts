import {
  http,
  HttpResponse,
} from 'msw'

import {
  expireActiveSession,
} from '@/mocks/database/sessions'

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
      'favorite-mutation-error'
  )
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