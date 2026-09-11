import { useNavigate } from '@tanstack/react-router'

import { PageContainer } from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import type { Nft } from '@/features/nft/types/nft'

import { CatalogPagination } from './catalog-pagination'
import { CatalogToolbar } from './catalog-toolbar'
import { FeaturedNft } from './featured-nft'
import { FilterSidebar } from './filter-sidebar'
import { NftCard } from './nft-card'

import type { CatalogParams } from '../types/catalog'

type CatalogSectionProps = {
  params: CatalogParams
  nfts: Nft[]
  total: number
  pageSize: number
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

function CatalogCardSkeleton() {
  return (
    <div
      className="
        flex
        flex-col
        gap-2
        lg:gap-3
      "
      aria-hidden="true"
    >
      <div
        className="
          rounded-[20px]
          bg-[var(--color-surface-card)]
          px-1
          pt-3
          pb-5
          lg:bg-transparent
          lg:p-0
        "
      >
        <div
          className="
            relative
            aspect-square
            w-full
            overflow-hidden
            rounded-[16px]
            bg-muted
            before:absolute
            before:inset-0
            before:-translate-x-full
            before:bg-gradient-to-r
            before:from-transparent
            before:via-white/8
            before:to-transparent
            before:animate-[shimmer_1.6s_infinite]
            motion-reduce:before:animate-none
            lg:rounded-[15px]
          "
        />
      </div>

      <div
        className="
          relative
          ml-1
          h-4
          w-3/4
          overflow-hidden
          rounded-sm
          bg-muted
          before:absolute
          before:inset-0
          before:-translate-x-full
          before:bg-gradient-to-r
          before:from-transparent
          before:via-white/8
          before:to-transparent
          before:animate-[shimmer_1.6s_infinite]
          motion-reduce:before:animate-none
          lg:ml-0
        "
      />

      <div
        className="
          relative
          ml-1
          h-4
          w-2/5
          overflow-hidden
          rounded-sm
          bg-muted
          before:absolute
          before:inset-0
          before:-translate-x-full
          before:bg-gradient-to-r
          before:from-transparent
          before:via-white/8
          before:to-transparent
          before:animate-[shimmer_1.6s_infinite]
          motion-reduce:before:animate-none
          lg:ml-0
        "
      />
    </div>
  )
}

function CatalogLoadingState() {
  return (
    <div
      className="
        mt-5
        grid
        grid-cols-2
        gap-x-4
        gap-y-8
        lg:mt-8
        lg:grid-cols-3
        lg:gap-x-[34px]
        lg:gap-y-10
      "
      aria-label="Carregando NFTs"
      aria-busy="true"
    >
      {Array.from(
        {
          length: 9,
        },
        (_, index) => (
          <CatalogCardSkeleton
            key={index}
          />
        ),
      )}
    </div>
  )
}

export function CatalogSection({
  params,
  nfts,
  total,
  pageSize,
  isLoading = false,
  isError = false,
  onRetry,
}: CatalogSectionProps) {
  const navigate = useNavigate({
    from: '/',
  })

  const hasResults =
    nfts.length > 0

  const hasPagination =
    total > pageSize

  function handleClearFilters() {
    void navigate({
      search: {
        search: undefined,
        network: undefined,
        category: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sort: 'featured',
        tab: 'all',
        page: 1,
      },

      resetScroll: false,
    })
  }

  return (
    <section
      id="catalog"
      className="
        scroll-mt-6
        bg-background
        pb-10
        lg:pt-10
        lg:pb-14
      "
    >
      <PageContainer>
        <div
          className="
            flex
            w-full
            items-start
            gap-8
            px-6
            lg:px-0
          "
        >
          <div
            className="
              hidden
              w-[310px]
              shrink-0
              lg:block
            "
          >
            <FilterSidebar
              params={
                params
              }
            />

            <FeaturedNft />
          </div>

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <CatalogToolbar
              params={
                params
              }
            />

            {isLoading ? (
              <CatalogLoadingState />
            ) : isError ? (
              <div
                className="
                  mt-5
                  flex
                  min-h-[240px]
                  flex-col
                  items-center
                  justify-center
                  rounded-[16px]
                  border
                  border-border
                  bg-card
                  px-5
                  text-center
                  lg:mt-8
                  lg:min-h-[320px]
                  lg:rounded-none
                  lg:px-8
                "
                role="alert"
              >
                <h2
                  className="
                    text-[18px]
                    font-bold
                    text-foreground
                    lg:text-[20px]
                  "
                >
                  Não foi possível carregar os NFTs
                </h2>

                <p
                  className="
                    mt-3
                    max-w-[420px]
                    text-[13px]
                    leading-5
                    text-muted-foreground
                    lg:text-[14px]
                    lg:leading-6
                  "
                >
                  Ocorreu um erro ao carregar o catálogo.
                  Tente novamente em alguns instantes.
                </p>

                {onRetry && (
                  <Button
                    type="button"
                    className="mt-6"
                    onClick={
                      onRetry
                    }
                  >
                    Tentar novamente
                  </Button>
                )}
              </div>
            ) : hasResults ? (
              <>
                <div
                  className="
                    mt-5
                    grid
                    grid-cols-2
                    gap-x-4
                    gap-y-8
                    lg:mt-8
                    lg:grid-cols-3
                    lg:gap-x-[34px]
                    lg:gap-y-10
                  "
                >
                  {nfts.map(
                    (nft) => (
                      <NftCard
                        key={
                          nft.id
                        }
                        nft={
                          nft
                        }
                      />
                    ),
                  )}
                </div>

                {hasPagination && (
                  <div
                    className="
                      mt-8
                      lg:mt-14
                    "
                  >
                    <CatalogPagination
                      params={
                        params
                      }
                      total={
                        total
                      }
                      pageSize={
                        pageSize
                      }
                    />
                  </div>
                )}
              </>
            ) : (
              <div
                className="
                  mt-5
                  flex
                  min-h-[240px]
                  flex-col
                  items-center
                  justify-center
                  rounded-[16px]
                  border
                  border-border
                  bg-card
                  px-5
                  text-center
                  lg:mt-8
                  lg:min-h-[320px]
                  lg:rounded-none
                  lg:px-8
                "
              >
                <h2
                  className="
                    text-[18px]
                    font-bold
                    text-foreground
                    lg:text-[20px]
                  "
                >
                  Nenhum NFT encontrado
                </h2>

                <p
                  className="
                    mt-3
                    max-w-[420px]
                    text-[13px]
                    leading-5
                    text-muted-foreground
                    lg:text-[14px]
                    lg:leading-6
                  "
                >
                  Não encontramos NFTs com os filtros selecionados.
                  Tente alterar os filtros ou limpar a busca para visualizar
                  outros itens.
                </p>

                <Button
                  type="button"
                  className="mt-6"
                  onClick={
                    handleClearFilters
                  }
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
