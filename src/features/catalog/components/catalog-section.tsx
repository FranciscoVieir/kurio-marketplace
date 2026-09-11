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
        gap-3
      "
      aria-hidden="true"
    >
      <div
        className="
          relative
          aspect-square
          w-full
          overflow-hidden
          rounded-[15px]
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
        "
      />

      <div
        className="
          relative
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
        "
      />

      <div
        className="
          relative
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
        "
      />
    </div>
  )
}

function CatalogLoadingState() {
  return (
    <div
      className="
        mt-8
        grid
        grid-cols-3
        gap-x-[34px]
        gap-y-10
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
        pt-8
        pb-10
      "
    >
      <PageContainer>
        <div
          className="
            flex
            items-start
            gap-8
          "
        >
          <div
            className="
              w-[310px]
              shrink-0
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
                  mt-8
                  flex
                  min-h-[320px]
                  flex-col
                  items-center
                  justify-center
                  border
                  border-border
                  bg-card
                  px-8
                  text-center
                "
                role="alert"
              >
                <h2
                  className="
                    text-[20px]
                    font-bold
                    text-foreground
                  "
                >
                  Não foi possível carregar os NFTs
                </h2>

                <p
                  className="
                    mt-3
                    max-w-[420px]
                    text-[14px]
                    leading-6
                    text-muted-foreground
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
                    mt-8
                    grid
                    grid-cols-3
                    gap-x-[34px]
                    gap-y-10
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
                )}
              </>
            ) : (
              <div
                className="
                  mt-8
                  flex
                  min-h-[320px]
                  flex-col
                  items-center
                  justify-center
                  border
                  border-border
                  bg-card
                  px-8
                  text-center
                "
              >
                <h2
                  className="
                    text-[20px]
                    font-bold
                    text-foreground
                  "
                >
                  Nenhum NFT encontrado
                </h2>

                <p
                  className="
                    mt-3
                    max-w-[420px]
                    text-[14px]
                    leading-6
                    text-muted-foreground
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