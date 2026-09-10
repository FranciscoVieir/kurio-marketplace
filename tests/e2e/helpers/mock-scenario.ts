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

async function waitForMockingReady(
  page: Page,
) {
  /*
   * No bootstrap da aplicação,
   * o React só é renderizado depois
   * que enableMocking() termina.
   *
   * Portanto, esperar o #root possuir
   * conteúdo garante que o MSW já foi
   * inicializado antes de acessarmos
   * os endpoints /api/__mock/*.
   */
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
            method: 'POST',

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
        const body =
          await response.text()

        throw new Error(
          `Failed to activate mock scenario "${selectedScenario}". Status: ${response.status}. Body: ${body}`,
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
            method: 'DELETE',
          },
        )

      if (!response.ok) {
        const body =
          await response.text()

        throw new Error(
          `Failed to reset mock scenario. Status: ${response.status}. Body: ${body}`,
        )
      }
    },
  )
}