import type { Nft } from '@/features/nft/types/nft'

type NftDetailGalleryProps = {
  nft: Nft
}

export function NftDetailGallery({
  nft,
}: NftDetailGalleryProps) {
  return (
    <div className="flex shrink-0 gap-[16px]">
      <div className="flex w-[72px] flex-col gap-[12px]">
        {Array.from({ length: 4 }).map((_, index) => (
          <button
            key={index}
            type="button"
            className="
              h-[72px] w-[72px]
              overflow-hidden
              rounded-[6px]
              border border-border
              bg-card
            "
            aria-label={`Visualizar imagem ${index + 1} de ${nft.name}`}
          >
            {nft.imageUrl ? (
              <img
                src={nft.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className="
                  flex h-full items-center justify-center
                  text-[10px]
                  text-muted-foreground
                "
              >
                NFT
              </span>
            )}
          </button>
        ))}
      </div>

      <div
        className="
          h-[390px] w-[390px]
          overflow-hidden
          rounded-[18px]
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
    </div>
  )
}