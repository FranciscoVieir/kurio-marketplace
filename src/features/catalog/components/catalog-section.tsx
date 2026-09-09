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
}

export function CatalogSection({
  params,
  nfts,
  total,
  pageSize,
}: CatalogSectionProps) {
  const navigate = useNavigate({
    from: '/',
  })

  const hasResults = nfts.length > 0
  const hasPagination = total > pageSize

  function handleClearFilters() {
    navigate({
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
    })
  }

  return (
    <section
      id="catalog"
      className="scroll-mt-6 bg-background pb-10 pt-8"
    >
      <PageContainer>
        <div className="flex items-start gap-8">
          <div className="w-[310px] shrink-0">
            <FilterSidebar params={params} />

            <FeaturedNft />
          </div>

          <div className="min-w-0 flex-1">
            <CatalogToolbar params={params} />

            {hasResults ? (
              <>
                <div
                  className="
                    mt-8 grid
                    grid-cols-3
                    gap-x-[34px]
                    gap-y-10
                  "
                >
                  {nfts.map((nft) => (
                    <NftCard
                      key={nft.id}
                      nft={nft}
                    />
                  ))}
                </div>

                {hasPagination && (
                  <CatalogPagination
                    params={params}
                    total={total}
                    pageSize={pageSize}
                  />
                )}
              </>
            ) : (
              <div className="mt-8 flex min-h-[320px] flex-col items-center justify-center border border-border bg-card px-8 text-center">
                <h2 className="text-[20px] font-bold text-foreground">
                  Nenhum NFT encontrado
                </h2>

                <p className="mt-3 max-w-[420px] text-[14px] leading-6 text-muted-foreground">
                  Não encontramos NFTs com os filtros selecionados.
                  Tente alterar os filtros ou limpar a busca para visualizar
                  outros itens.
                </p>

                <Button
                  type="button"
                  className="mt-6"
                  onClick={handleClearFilters}
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