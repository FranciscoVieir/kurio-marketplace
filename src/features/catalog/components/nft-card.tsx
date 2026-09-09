import { Link } from '@tanstack/react-router'

import type { Nft } from '@/features/nft/types/nft'

type NftCardProps = {
  nft: Nft
}

export function NftCard({ nft }: NftCardProps) {
  return (
    <article className="flex w-[258px] flex-col gap-3">
      <Link
        to="/nft/$nftId"
        params={{
          nftId: nft.id,
        }}
        className="block"
      >
        <div
          className="
            h-[250px] w-[250px]
            overflow-hidden rounded-[15px]
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
                flex h-full w-full
                items-center justify-center
                text-muted-foreground
              "
            >
              NFT
            </div>
          )}
        </div>

        <h3
          className="
            mt-3
            text-[16px] font-normal leading-[16px]
            text-foreground
          "
        >
          {nft.name}
        </h3>
      </Link>

      <div className="flex items-center gap-2">
        <span
          className="
            text-[18px] font-bold leading-[16px]
            text-[var(--color-text-accent)]
          "
        >
          {nft.priceEth} ETH
        </span>

        {nft.previousPriceEth && (
          <span
            className="
              text-[18px] font-normal leading-[16px]
              text-[var(--color-secondary-kurio)]
            "
          >
            {nft.previousPriceEth} ETH
          </span>
        )}
      </div>
    </article>
  )
}