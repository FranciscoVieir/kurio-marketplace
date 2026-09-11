import { Link } from '@tanstack/react-router'

import type { Nft } from '@/features/nft/types/nft'

type NftCardProps = {
  nft: Nft
}

export function NftCard({ nft }: NftCardProps) {
  return (
    <article
      className="
        flex
        min-w-0
        w-full
        flex-col
        gap-2
        lg:w-[258px]
        lg:gap-3
      "
    >
      <Link
        to="/nft/$nftId"
        params={{
          nftId: nft.id,
        }}
        className="
          block
          min-w-0
        "
      >
        <div
          className="
            w-full
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
              aspect-square
              w-full
              overflow-hidden
              rounded-[16px]
              bg-card
              lg:h-[250px]
              lg:w-[250px]
              lg:rounded-[15px]
            "
          >
            {nft.imageUrl ? (
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  text-muted-foreground
                "
              >
                NFT
              </div>
            )}
          </div>
        </div>

        <h3
          className="
            mt-2
            truncate
            px-1
            text-[15px]
            font-normal
            leading-[15px]
            text-foreground
            lg:mt-3
            lg:px-0
            lg:text-[16px]
            lg:leading-[16px]
          "
        >
          {nft.name}
        </h3>
      </Link>

      <div
        className="
          flex
          min-w-0
          items-center
          gap-2
          px-1
          lg:px-0
        "
      >
        <span
          className="
            whitespace-nowrap
            text-[16px]
            font-bold
            leading-[16px]
            text-[var(--color-text-accent)]
            lg:text-[18px]
          "
        >
          {nft.priceEth} ETH
        </span>

        {nft.previousPriceEth && (
          <span
            className="
              truncate
              text-[14px]
              font-normal
              leading-[16px]
              text-[var(--color-secondary-kurio)]
              lg:text-[18px]
            "
          >
            {nft.previousPriceEth} ETH
          </span>
        )}
      </div>
    </article>
  )
}
