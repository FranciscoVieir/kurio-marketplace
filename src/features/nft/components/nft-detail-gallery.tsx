import {
  useState,
} from 'react'

import type { Nft } from '@/features/nft/types/nft'

type NftDetailGalleryProps = {
  nft: Nft
}

export function NftDetailGallery({
  nft,
}: NftDetailGalleryProps) {
  const [
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useState(0)

  const [
    isImageLoading,
    setIsImageLoading,
  ] = useState(true)

  function handleSelectImage(
    index: number,
  ) {
    setSelectedImageIndex(
      index,
    )

    setIsImageLoading(
      true,
    )
  }

  return (
    <div
      className="
        flex
        shrink-0
        gap-[16px]
      "
    >
      <div
        className="
          flex
          w-[72px]
          flex-col
          gap-[12px]
        "
      >
        {Array.from({
          length: 4,
        }).map(
          (
            _,
            index,
          ) => {
            const isSelected =
              selectedImageIndex ===
              index

            return (
              <button
                key={index}
                type="button"
                onClick={() =>
                  handleSelectImage(
                    index,
                  )
                }
                aria-label={`Visualizar imagem ${index + 1} de ${nft.name}`}
                aria-pressed={
                  isSelected
                }
                className={`
                  relative
                  h-[72px]
                  w-[72px]
                  overflow-hidden
                  rounded-[6px]
                  border
                  bg-[var(--color-surface-card)]
                  transition-colors
                  ${
                    isSelected
                      ? `
                        border-[var(--color-primary-kurio)]
                        ring-1
                        ring-[var(--color-primary-kurio)]/35
                      `
                      : `
                        border-[var(--color-border-kurio)]
                        hover:border-[var(--color-primary-kurio)]/60
                      `
                  }
                `}
              >
                {nft.imageUrl ? (
                  <img
                    src={
                      nft.imageUrl
                    }
                    alt=""
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />
                ) : (
                  <span
                    className="
                      flex
                      h-full
                      items-center
                      justify-center
                      text-[10px]
                      text-[var(--color-text-secondary)]
                    "
                  >
                    NFT
                  </span>
                )}
              </button>
            )
          },
        )}
      </div>

      <div
        className="
          relative
          h-[390px]
          w-[390px]
          overflow-hidden
          rounded-[18px]
          bg-[var(--color-surface-card)]
        "
      >
        {isImageLoading &&
          nft.imageUrl && (
            <div
              aria-hidden="true"
              className="
                absolute
                inset-0
                z-10
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
          )}

        {nft.imageUrl ? (
          <img
            key={
              selectedImageIndex
            }
            src={
              nft.imageUrl
            }
            alt={
              nft.name
            }
            onLoad={() =>
              setIsImageLoading(
                false,
              )
            }
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
              items-center
              justify-center
              text-[14px]
              text-[var(--color-text-secondary)]
            "
          >
            NFT
          </div>
        )}
      </div>
    </div>
  )
}