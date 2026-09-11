import type {
  Page,
} from '@playwright/test'

type UpdateNftRealtimeInput = {
  nftId: string
  priceEth?: string
  availableQuantity?: number
}

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

export async function updateNftRealtime(
  page: Page,
  input: UpdateNftRealtimeInput,
) {
  await waitForMockingReady(
    page,
  )

  return page.evaluate(
    async (
      realtimeInput,
    ) => {
      const response =
        await fetch(
          '/api/__mock/realtime/nft',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify(
                realtimeInput,
              ),
          },
        )

      const body =
        await response.json()

      if (!response.ok) {
        throw new Error(
          `Não foi possível atualizar o NFT em realtime. HTTP ${response.status}`,
        )
      }

      return body
    },
    input,
  )
}