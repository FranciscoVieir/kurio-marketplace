import { Link } from '@tanstack/react-router'

import type { Nft } from '@/features/nft/types/nft'

type NftRecommendationsProps = {
  title: string
  nfts: Nft[]
  className?: string
}

export function NftRecommendations({
  title,
  nfts,
  className = '',
}: NftRecommendationsProps) {
  if (nfts.length === 0) {
    return null
  }

  return (
    <section className={`mt-[72px] ${className}`}>
      <div className="border-b border-border pb-[10px]">
        <h2
          className="
            text-[14px] font-bold
            text-[var(--color-text-accent)]
          "
        >
          {title}
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
        {nfts.map((nft) => (
          <Link
            key={nft.id}
            to="/nft/$nftId"
            params={{
              nftId: nft.id,
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
                {nft.imageUrl ? (
                  <img
                    src={nft.imageUrl}
                    alt={nft.name}
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
                {nft.name}
              </p>

              <p
                className="
                  mt-[4px]
                  text-[12px] font-bold
                  text-[var(--color-text-accent)]
                "
              >
                {nft.priceEth} ETH
              </p>
            </article>
          </Link>
        ))}
      </div>

      {nfts.length > 1 && (
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