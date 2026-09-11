import type {
  Page,
} from '@playwright/test'

export type MockScenario =
  | 'default'
  | 'quote-expired'
  | 'insufficient-stock'
  | 'nft-price-changed'
  | 'nft-version-changed'
  | 'session-expired'
  | 'favorite-mutation-error'
  | 'payment-refused'
  | 'payment-timeout'

async function waitForMockingReady(
  page: Page,
) {
  await page.waitForFunction(
    () => {
      const root =
        document.querySelector(
          '#root',
        )

      return Boolean(
        root &&
          root.childElementCount >
            0,
      )
    },
  )
}

export async function setMockScenario(
  page: Page,
  scenario: MockScenario,
) {
  await waitForMockingReady(
    page,
  )

  await page.evaluate(
    async (
      selectedScenario,
    ) => {
      const response =
        await fetch(
          '/api/__mock/scenario',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                scenario:
                  selectedScenario,
              }),
          },
        )

      if (!response.ok) {
        throw new Error(
          `Não foi possível ativar o cenário ${selectedScenario}.`,
        )
      }
    },
    scenario,
  )
}

export async function resetMockScenario(
  page: Page,
) {
  await waitForMockingReady(
    page,
  )

  await page.evaluate(
    async () => {
      const response =
        await fetch(
          '/api/__mock/scenario',
          {
            method:
              'DELETE',
          },
        )

      if (!response.ok) {
        throw new Error(
          'Não foi possível resetar o cenário mock.',
        )
      }
    },
  )
}