import { Link } from '@tanstack/react-router'

import { useNfts } from '@/features/catalog/hooks/use-nfts'
import type { Nft } from '@/features/nft/types/nft'

type RelatedNftsSectionProps = {
  nft: Nft
}

export function RelatedNftsSection({
  nft,
}: RelatedNftsSectionProps) {
  const {
    data,
    isLoading,
    isError,
  } = useNfts({
    category: nft.category,
    page: 1,
  })

  const relatedNfts =
    data?.items
      .filter((item) => item.id !== nft.id)
      .slice(0, 5) ?? []

  if (isLoading) {
    return (
      <section className="mt-[72px]">
        <div className="border-b border-border pb-[10px]">
          <h2
            className="
              text-[14px] font-bold
              text-[var(--color-text-accent)]
            "
          >
            Mais desta coleção
          </h2>
        </div>

        <p className="mt-[20px] text-[12px] text-muted-foreground">
          Carregando itens relacionados...
        </p>
      </section>
    )
  }

  if (isError || relatedNfts.length === 0) {
    return null
  }

  return (
    <section className="mt-[72px]">
      <div className="border-b border-border pb-[10px]">
        <h2
          className="
            text-[14px] font-bold
            text-[var(--color-text-accent)]
          "
        >
          Mais desta coleção
        </h2>
      </div>

      <div
        className="
          mt-[20px] flex
          gap-[20px]
          overflow-x-auto
          pb-[8px]
        "
      >
        {relatedNfts.map((relatedNft) => (
          <Link
            key={relatedNft.id}
            to="/nft/$nftId"
            params={{
              nftId: relatedNft.id,
            }}
            className="block w-[190px] shrink-0"
          >
            <article>
              <div
                className="
                  h-[190px] w-[190px]
                  overflow-hidden
                  rounded-[8px]
                  bg-card
                "
              >
                {relatedNft.imageUrl ? (
                  <img
                    src={relatedNft.imageUrl}
                    alt={relatedNft.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="
                      flex h-full items-center justify-center
                      text-muted-foreground
                    "
                  >
                    NFT
                  </div>
                )}
              </div>

              <p
                className="
                  mt-[8px]
                  text-[12px] font-normal
                  text-foreground
                "
              >
                {relatedNft.name}
              </p>

              <p
                className="
                  mt-[4px]
                  text-[12px] font-bold
                  text-[var(--color-text-accent)]
                "
              >
                {relatedNft.priceEth} ETH
              </p>
            </article>
          </Link>
        ))}
      </div>

      {relatedNfts.length > 1 && (
        <div className="mt-[12px] flex justify-center gap-[5px]">
          <span
            className="
              h-[6px] w-[6px]
              rounded-full
              bg-[var(--color-primary-kurio)]
            "
          />

          <span
            className="
              h-[6px] w-[6px]
              rounded-full
              border border-[var(--color-primary-kurio)]
            "
          />

          <span
            className="
              h-[6px] w-[6px]
              rounded-full
              border border-[var(--color-primary-kurio)]
            "
          />
        </div>
      )}
    </section>
  )
}