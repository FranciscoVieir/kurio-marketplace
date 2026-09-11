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
    <section
      className={`
        mt-[72px]
        ${className}
      `}
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
            leading-[18px]
            text-[var(--color-text-accent)]
          "
        >
          {title}
        </h2>
      </div>

      <div
        className="
          mt-[20px]
          flex
          w-full
          justify-between
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
            className="
              group
              block
              w-[190px]
              shrink-0
            "
          >
            <article>
              <div
                className="
                  h-[190px]
                  w-[190px]
                  overflow-hidden
                  rounded-[10px]
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]
                "
              >
                {nft.imageUrl ? (
                  <img
                    src={nft.imageUrl}
                    alt={nft.name}
                    loading="lazy"
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-300
                      group-hover:scale-[1.03]
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      items-center
                      justify-center
                      text-[13px]
                      text-[var(--color-text-secondary)]
                    "
                  >
                    NFT
                  </div>
                )}
              </div>

              <div className="pt-[10px]">
                <p
                  className="
                    truncate
                    text-[13px]
                    font-medium
                    leading-[18px]
                    text-[var(--color-foreground-kurio)]
                    transition-colors
                    group-hover:text-[var(--color-text-accent)]
                  "
                >
                  {nft.name}
                </p>

                <p
                  className="
                    mt-[5px]
                    text-[13px]
                    font-bold
                    leading-[18px]
                    text-[var(--color-text-accent)]
                  "
                >
                  {nft.priceEth} ETH
                </p>

                <p
                  className="
                    mt-[3px]
                    truncate
                    text-[11px]
                    font-normal
                    leading-[16px]
                    text-[var(--color-text-secondary)]
                  "
                >
                  {nft.collection}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {nfts.length > 1 && (
        <div
          className="
            mt-[14px]
            flex
            justify-center
            gap-[6px]
          "
          aria-hidden="true"
        >
          <span
            className="
              h-[6px]
              w-[6px]
              rounded-full
              bg-[var(--color-primary-kurio)]
            "
          />

          <span
            className="
              h-[6px]
              w-[6px]
              rounded-full
              border
              border-[var(--color-primary-kurio)]
            "
          />

          <span
            className="
              h-[6px]
              w-[6px]
              rounded-full
              border
              border-[var(--color-primary-kurio)]
            "
          />
        </div>
      )}
    </section>
  )
}