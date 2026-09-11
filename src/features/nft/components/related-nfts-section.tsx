import { useNfts } from '@/features/catalog/hooks/use-nfts'
import { NftRecommendations } from '@/features/nft/components/nft-recommendations'

import type { Nft } from '@/features/nft/types/nft'

type RelatedNftsSectionProps = {
  nft: Nft
}

function RelatedNftsSkeleton() {
  return (
    <section
      className="
        mt-[72px]
      "
      aria-label="Carregando NFTs relacionados"
    >
      <div
        className="
          border-b
          border-[var(--color-border-kurio)]
          pb-[10px]
        "
      >
        <h2
          className="
            text-[14px]
            font-bold
            text-[var(--color-text-accent)]
          "
        >
          Mais desta coleção
        </h2>
      </div>

      <div
        className="
          mt-[20px]
          grid
          grid-cols-5
          gap-[16px]
        "
      >
        {Array.from({
          length: 5,
        }).map(
          (
            _,
            index,
          ) => (
            <article
              key={index}
              className="
                overflow-hidden
                rounded-[8px]
                bg-[var(--color-surface-card)]
              "
            >
              <div
                className="
                  relative
                  h-[190px]
                  w-full
                  overflow-hidden
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

              <div
                className="
                  space-y-[10px]
                  p-[12px]
                "
              >
                <div
                  className="
                    h-[14px]
                    w-[70%]
                    rounded-[4px]
                    bg-[var(--color-border-kurio)]
                  "
                />

                <div
                  className="
                    h-[12px]
                    w-[45%]
                    rounded-[4px]
                    bg-[var(--color-border-kurio)]
                  "
                />

                <div
                  className="
                    h-[14px]
                    w-[35%]
                    rounded-[4px]
                    bg-[var(--color-primary-kurio)]/25
                  "
                />
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  )
}

export function RelatedNftsSection({
  nft,
}: RelatedNftsSectionProps) {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useNfts({
    category: nft.category,
    page: 1,
  })

  const relatedNfts =
    data?.items
      .filter(
        (item) =>
          item.id !== nft.id,
      )
      .slice(
        0,
        5,
      ) ?? []

  if (
    isLoading ||
    isFetching
  ) {
    return (
      <RelatedNftsSkeleton />
    )
  }

  if (isError) {
    return (
      <section
        className="
          mt-[72px]
        "
      >
        <div
          className="
            border-b
            border-[var(--color-border-kurio)]
            pb-[10px]
          "
        >
          <h2
            className="
              text-[14px]
              font-bold
              text-[var(--color-text-accent)]
            "
          >
            Mais desta coleção
          </h2>
        </div>

        <div
          className="
            mt-[20px]
            rounded-[8px]
            border
            border-[var(--color-border-kurio)]
            bg-[var(--color-surface-card)]
            p-[20px]
          "
          role="alert"
        >
          <p
            className="
              text-[13px]
              leading-[20px]
              text-[var(--color-text-secondary)]
            "
          >
            Não foi possível carregar os NFTs relacionados.
          </p>

          <button
            type="button"
            onClick={() =>
              void refetch()
            }
            className="
              mt-[12px]
              h-[36px]
              rounded-[6px]
              bg-[var(--color-primary-kurio)]
              px-[16px]
              text-[12px]
              font-bold
              text-[var(--color-ink)]
            "
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      </section>
    )
  }

  if (
    relatedNfts.length === 0
  ) {
    return null
  }

  return (
    <NftRecommendations
      title="Mais desta coleção"
      nfts={
        relatedNfts
      }
    />
  )
}