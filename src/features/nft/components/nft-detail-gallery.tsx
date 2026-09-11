import {
  useState,
} from 'react'

import {
  ChevronLeft,
  Heart,
} from 'lucide-react'

import { useFavorites } from '@/features/favorites/hooks/use-favorites'

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

  const {
    isFavorite,
    toggleFavorite,
  } = useFavorites()

  const favorite =
    isFavorite(
      nft.id,
    )

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

  function handleBack() {
    window.history.back()
  }

  function handleToggleFavorite() {
    toggleFavorite(
      nft.id,
    )
  }

  return (
    <div
      className="
        flex
        shrink-0
        gap-[16px]

        max-md:mx-auto
        max-md:w-full
        max-md:max-w-[361px]
        max-md:flex-col
        max-md:gap-[8px]
      "
    >
      {/* Desktop: thumbnails */}
      <div
        className="
          flex
          w-[72px]
          flex-col
          gap-[12px]

          max-md:hidden
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

      {/* Mobile: voltar + favorito */}
      <div
        className="
          hidden

          max-md:flex
          max-md:h-[35px]
          max-md:w-full
          max-md:items-center
          max-md:justify-between
        "
      >
        <button
          type="button"
          onClick={
            handleBack
          }
          aria-label="Voltar"
          className="
            flex
            h-[35px]
            w-[35px]
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-[var(--color-border-kurio)]
            bg-[var(--color-surface-raised)]
            text-[var(--color-primary-kurio)]
            transition-opacity
            active:opacity-70
          "
        >
          <ChevronLeft
            size={16}
            strokeWidth={1.5}
          />
        </button>

        <button
          type="button"
          onClick={
            handleToggleFavorite
          }
          aria-label={
            favorite
              ? `Remover ${nft.name} dos favoritos`
              : `Adicionar ${nft.name} aos favoritos`
          }
          aria-pressed={
            favorite
          }
          className="
            flex
            h-[35px]
            w-[35px]
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-[var(--color-border-kurio)]
            bg-[var(--color-surface-raised)]
            text-[var(--color-primary-kurio)]
            transition-opacity
            active:opacity-70
          "
        >
          <Heart
            size={16}
            strokeWidth={1.5}
            fill={
              favorite
                ? 'currentColor'
                : 'none'
            }
          />
        </button>
      </div>

      {/* Imagem principal */}
      <div
        className="
          relative
          h-[390px]
          w-[390px]
          overflow-hidden
          rounded-[18px]
          bg-[var(--color-surface-card)]

          max-md:h-auto
          max-md:w-full
          max-md:aspect-[361/356]
          max-md:rounded-[24px]
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