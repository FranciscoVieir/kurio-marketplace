import {
  Link,
  useParams,
} from '@tanstack/react-router'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { PageContainer } from '@/components/layout/page-container'
import { BenefitsSection } from '@/features/home/components/benefits-section'
import { NftDetailContent } from '@/features/nft/components/nft-detail-content'
import { NftDetailGallery } from '@/features/nft/components/nft-detail-gallery'
import { NftPurchasePanel } from '@/features/nft/components/nft-purchase-panel'
import { RelatedNftsSection } from '@/features/nft/components/related-nfts-section'
import { useNft } from '@/features/nft/hooks/use-nft'

function NftDetailSkeleton() {
  return (
    <section
      className="
        flex
        min-h-[520px]
        items-start
        gap-[24px]
      "
      aria-label="Carregando detalhes do NFT"
    >
      <div
        className="
          flex
          w-[586px]
          gap-[16px]
        "
      >
        <div
          className="
            flex
            w-[76px]
            flex-col
            gap-[12px]
          "
        >
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="
                relative
                h-[76px]
                w-[76px]
                overflow-hidden
                rounded-[8px]
                bg-[var(--color-surface-card)]
                before:absolute
                before:inset-0
                before:-translate-x-full
                before:animate-[shimmer_1.6s_infinite]
                before:bg-gradient-to-r
                before:from-transparent
                before:via-white/5
                before:to-transparent
                motion-reduce:before:animate-none
              "
            />
          ))}
        </div>

        <div
          className="
            relative
            h-[500px]
            flex-1
            overflow-hidden
            rounded-[16px]
            bg-[var(--color-surface-card)]
            before:absolute
            before:inset-0
            before:-translate-x-full
            before:animate-[shimmer_1.6s_infinite]
            before:bg-gradient-to-r
            before:from-transparent
            before:via-white/5
            before:to-transparent
            motion-reduce:before:animate-none
          "
        />
      </div>

      <div
        className="
          flex
          min-h-[500px]
          flex-1
          flex-col
          gap-[20px]
        "
      >
        <div
          className="
            h-[16px]
            w-[130px]
            rounded-[4px]
            bg-[var(--color-surface-card)]
          "
        />

        <div
          className="
            h-[42px]
            w-[70%]
            rounded-[6px]
            bg-[var(--color-surface-card)]
          "
        />

        <div
          className="
            h-[20px]
            w-[45%]
            rounded-[4px]
            bg-[var(--color-surface-card)]
          "
        />

        <div
          className="
            mt-[8px]
            h-[88px]
            w-full
            rounded-[8px]
            bg-[var(--color-surface-card)]
          "
        />

        <div
          className="
            mt-auto
            h-[48px]
            w-full
            rounded-[6px]
            bg-[var(--color-primary-kurio)]/35
          "
        />
      </div>
    </section>
  )
}

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
    <div
      className="
        min-h-screen
        bg-background
      "
    >
      <Header />

      <main>
        <PageContainer
          className="
            pt-[20px]
          "
        >
          <nav
            aria-label="Breadcrumb"
            className="
              flex
              items-center
              gap-[8px]
              text-[12px]
              font-normal
              leading-[16px]
              text-[var(--color-text-secondary)]
            "
          >
            <Link
              to="/"
              className="
                transition-colors
                hover:text-[var(--color-text-accent)]
              "
            >
              Início
            </Link>

            <span
              aria-hidden="true"
            >
              /
            </span>

            <Link
              to="/"
              hash="catalog"
              className="
                transition-colors
                hover:text-[var(--color-text-accent)]
              "
            >
              Mercado
            </Link>

            {nft && (
              <>
                <span
                  aria-hidden="true"
                >
                  /
                </span>

                <span
                  className="
                    max-w-[280px]
                    truncate
                    text-[var(--color-foreground-kurio)]
                  "
                >
                  {nft.name}
                </span>
              </>
            )}
          </nav>
        </PageContainer>

        <PageContainer
          className="
            pb-[72px]
            pt-[24px]
          "
        >
          {isLoading && (
            <NftDetailSkeleton />
          )}

          {isError && (
            <section
              className="
                flex
                min-h-[500px]
                flex-col
                items-center
                justify-center
                text-center
              "
              role="alert"
            >
              <h1
                className="
                  text-[24px]
                  font-bold
                  leading-[30px]
                  text-[var(--color-foreground-kurio)]
                "
              >
                NFT não encontrado
              </h1>

              <p
                className="
                  mt-[10px]
                  max-w-[420px]
                  text-[14px]
                  font-normal
                  leading-[22px]
                  text-[var(--color-text-secondary)]
                "
              >
                Este NFT pode ter sido removido, estar indisponível ou o endereço
                acessado não existe.
              </p>

              <Link
                to="/"
                hash="catalog"
                className="
                  mt-[24px]
                  inline-flex
                  h-[40px]
                  items-center
                  justify-center
                  rounded-[6px]
                  bg-[var(--color-primary-kurio)]
                  px-[24px]
                  text-[14px]
                  font-bold
                  text-[var(--color-ink)]
                "
              >
                VOLTAR AO MERCADO
              </Link>
            </section>
          )}

          {nft && (
            <>
              <section
                className="
                  flex
                  items-start
                  gap-[24px]
                "
              >
                <NftDetailGallery
                  nft={nft}
                />

                <NftPurchasePanel
                  nft={nft}
                />
              </section>

              <NftDetailContent
                nft={nft}
              />

              <RelatedNftsSection
                nft={nft}
              />
            </>
          )}
        </PageContainer>

        <div
          className="
          "
        >
          <BenefitsSection />
        </div>
      </main>

      <Footer />
    </div>
  )
}