import { useParams } from '@tanstack/react-router'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { PageContainer } from '@/components/layout/page-container'
import { BenefitsSection } from '@/features/home/components/benefits-section'
import { NftDetailContent } from '@/features/nft/components/nft-detail-content'
import { NftDetailGallery } from '@/features/nft/components/nft-detail-gallery'
import { NftPurchasePanel } from '@/features/nft/components/nft-purchase-panel'
import { RelatedNftsSection } from '@/features/nft/components/related-nfts-section'
import { useNft } from '@/features/nft/hooks/use-nft'

export function NftDetailPage() {
  const { nftId } = useParams({
    from: '/nft/$nftId',
  })

  const {
    data: nft,
    isLoading,
    isError,
  } = useNft(nftId)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <PageContainer className="pt-6">
          <p className="text-[12px] font-normal text-muted-foreground">
            Início / Mercado
          </p>
        </PageContainer>

        <PageContainer className="pb-[72px] pt-6">
          {isLoading && (
            <div className="flex min-h-[500px] items-center justify-center">
              <p className="text-[14px] text-muted-foreground">
                Carregando NFT...
              </p>
            </div>
          )}

          {isError && (
            <div className="flex min-h-[500px] items-center justify-center">
              <p className="text-[14px] text-destructive">
                NFT não encontrado.
              </p>
            </div>
          )}

          {nft && (
            <>
              <section className="flex items-start gap-[24px]">
                <NftDetailGallery nft={nft} />

                <NftPurchasePanel nft={nft} />
              </section>

              <NftDetailContent nft={nft} />

              <RelatedNftsSection nft={nft} />
            </>
          )}
        </PageContainer>

        <div className="pb-[72px]">
          <BenefitsSection />
        </div>
      </main>

      <Footer />
    </div>
  )
}