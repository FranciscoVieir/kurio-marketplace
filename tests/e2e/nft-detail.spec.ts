import {
  expect,
  test,
} from '@playwright/test'

test.describe(
  'Detalhe do NFT',
  () => {
    test(
      'acessa diretamente um NFT existente e restaura após refresh',
      async ({ page }) => {
        /*
         * Primeiro descobrimos um NFT
         * válido a partir dos dados
         * determinísticos do catálogo.
         */
        await page.goto('/')

        const firstNftLink =
          page
            .locator(
              '#catalog article a',
            )
            .first()

        await expect(
          firstNftLink,
        ).toBeVisible({
          timeout: 10_000,
        })

        const nftName =
          (
            await firstNftLink
              .locator('h3')
              .innerText()
          ).trim()

        const nftHref =
          await firstNftLink
            .getAttribute(
              'href',
            )

        expect(
          nftHref,
        ).toBeTruthy()

        expect(
          nftHref,
        ).toMatch(
          /^\/nft\/.+/,
        )

        /*
         * Importante:
         *
         * usamos page.goto(), e não
         * click no Link.
         *
         * Isso força carregamento
         * direto da aplicação pela
         * URL /nft/:nftId.
         */
        const detailRequest =
          page.waitForResponse(
            (response) => {
              const url =
                new URL(
                  response.url(),
                )

              return (
                response
                  .request()
                  .method() ===
                  'GET' &&
                url.pathname.startsWith(
                  '/api/nfts/',
                )
              )
            },
            {
              timeout: 10_000,
            },
          )

        await page.goto(
          nftHref!,
        )

        const response =
          await detailRequest

        expect(
          response.status(),
        ).toBe(200)

        await expect(
          page,
        ).toHaveURL(
          /\/nft\/[^/?#]+$/,
        )

        /*
         * O título principal do NFT
         * precisa ser renderizado.
         */
        const nftTitle =
          page
            .locator(
              'h1:visible',
            )
            .filter({
              hasText:
                nftName,
            })
            .first()

        await expect(
          nftTitle,
        ).toBeVisible({
          timeout: 10_000,
        })

        await expect(
          nftTitle,
        ).toHaveText(
          nftName,
        )

        /*
         * O detalhe não pode estar
         * no estado de erro.
         */
        await expect(
          page.getByRole(
            'heading',
            {
              name:
                'NFT não encontrado',
              exact: true,
            },
          ),
        ).toHaveCount(0)

        /*
         * Reload comprova que a rota
         * direta não depende de
         * navegação anterior nem
         * de estado em memória.
         */
        const reloadRequest =
          page.waitForResponse(
            (reloadResponse) => {
              const url =
                new URL(
                  reloadResponse.url(),
                )

              return (
                reloadResponse
                  .request()
                  .method() ===
                  'GET' &&
                url.pathname.startsWith(
                  '/api/nfts/',
                )
              )
            },
            {
              timeout: 10_000,
            },
          )

        await page.reload()

        const reloadedResponse =
          await reloadRequest

        expect(
          reloadedResponse.status(),
        ).toBe(200)

        await expect(
          page
            .locator(
              'h1:visible',
            )
            .filter({
              hasText:
                nftName,
            })
            .first(),
        ).toBeVisible({
          timeout: 10_000,
        })
      },
    )

    test(
      'exibe estado de NFT inexistente ao acessar uma URL inválida diretamente',
      async ({ page }) => {
        const invalidNftId =
          'nft-inexistente-e2e'

        const detailRequest =
          page.waitForResponse(
            (response) => {
              const url =
                new URL(
                  response.url(),
                )

              return (
                response
                  .request()
                  .method() ===
                  'GET' &&
                url.pathname ===
                  `/api/nfts/${invalidNftId}`
              )
            },
            {
              timeout: 10_000,
            },
          )

        /*
         * Entrada direta na rota,
         * sem passar pela Home.
         */
        await page.goto(
          `/nft/${invalidNftId}`,
        )

        const response =
          await detailRequest

        expect(
          response.status(),
        ).toBe(404)

        await expect(
          page,
        ).toHaveURL(
          `/nft/${invalidNftId}`,
        )

        const errorAlert =
          page.getByRole(
            'alert',
          )

        await expect(
          errorAlert,
        ).toBeVisible({
          timeout: 10_000,
        })

        await expect(
          errorAlert.getByRole(
            'heading',
            {
              level: 1,
              name:
                'NFT não encontrado',
              exact: true,
            },
          ),
        ).toBeVisible()

        await expect(
          errorAlert,
        ).toContainText(
          'Este NFT pode ter sido removido',
        )

        const backToMarket =
          errorAlert.getByRole(
            'link',
            {
              name:
                'VOLTAR AO MERCADO',
              exact: true,
            },
          )

        await expect(
          backToMarket,
        ).toBeVisible()

        /*
         * O estado 404 também precisa
         * sobreviver a refresh.
         */
        await page.reload()

        await expect(
          page.getByRole(
            'heading',
            {
              level: 1,
              name:
                'NFT não encontrado',
              exact: true,
            },
          ),
        ).toBeVisible({
          timeout: 10_000,
        })
      },
    )
  },
)