import { PageContainer } from '@/components/layout/page-container'
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
  return (
    <section className="bg-background py-8">
      <PageContainer>
        <div className="flex items-start gap-8">
          <div className="w-[310px] shrink-0">
            <FilterSidebar params={params} />
            <FeaturedNft />
          </div>

          <div className="min-w-0 flex-1">
            <CatalogToolbar params={params} />

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

            <CatalogPagination
              params={params}
              total={total}
              pageSize={pageSize}
            />
          </div>
        </div>
      </PageContainer>
    </section>
  )
}