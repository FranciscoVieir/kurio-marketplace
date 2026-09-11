import {
  useState,
} from 'react'

import {
  Heart,
  Minus,
  Plus,
  Share2,
} from 'lucide-react'

import { useCart } from '@/features/cart/hooks/use-cart'
import { useFavorites } from '@/features/favorites/hooks/use-favorites'

import type { Nft } from '@/features/nft/types/nft'

type NftPurchasePanelProps = {
  nft: Nft
}

function formatNetwork(
  network: string,
) {
  switch (
    network.toLowerCase()
  ) {
    case 'ethereum':
      return 'Ethereum'

    case 'polygon':
      return 'Polygon'

    case 'solana':
      return 'Solana'

    default:
      return network
  }
}

export function NftPurchasePanel({
  nft,
}: NftPurchasePanelProps) {
  const [
    quantity,
    setQuantity,
  ] = useState(1)

  const [
    wasAddedToCart,
    setWasAddedToCart,
  ] = useState(false)

  const [
    wasLinkCopied,
    setWasLinkCopied,
  ] = useState(false)

  const {
    isFavorite,
    toggleFavorite,
  } = useFavorites()

  const {
    addItem,
    getItemQuantity,
  } = useCart()

  const favorite =
    isFavorite(
      nft.id,
    )

  const quantityInCart =
    getItemQuantity(
      nft.id,
    )

  const remainingQuantity =
    Math.max(
      0,
      nft.availableQuantity -
        quantityInCart,
    )

  const isMinimumQuantity =
    quantity <= 1

  const isMaximumQuantity =
    quantity >=
    remainingQuantity

  const isSoldOut =
    nft.availableQuantity <= 0

  const cannotAddMore =
    remainingQuantity <= 0

  function handleDecreaseQuantity() {
    setQuantity(
      (
        currentQuantity,
      ) =>
        Math.max(
          1,
          currentQuantity - 1,
        ),
    )

    setWasAddedToCart(
      false,
    )
  }

  function handleIncreaseQuantity() {
    if (
      cannotAddMore
    ) {
      return
    }

    setQuantity(
      (
        currentQuantity,
      ) =>
        Math.min(
          remainingQuantity,
          currentQuantity + 1,
        ),
    )

    setWasAddedToCart(
      false,
    )
  }

  function handleToggleFavorite() {
    toggleFavorite(
      nft.id,
    )
  }

  function handleAddToCart() {
    if (
      isSoldOut ||
      cannotAddMore ||
      quantity <= 0
    ) {
      return
    }

    addItem({
      nft,
      quantity,
    })

    setWasAddedToCart(
      true,
    )

    setQuantity(
      1,
    )
  }

  function handleReviewsClick() {
    const reviews =
      document.getElementById(
        'collector-reviews',
      )

    reviews?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(
        window.location.href,
      )

      setWasLinkCopied(
        true,
      )

      window.setTimeout(
        () => {
          setWasLinkCopied(
            false,
          )
        },
        2000,
      )
    } catch {
      setWasLinkCopied(
        false,
      )
    }
  }

  return (
    <div
      className="
        min-w-0
        flex-1
        pl-[8px]
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              text-[12px]
              font-medium
              uppercase
              leading-[16px]
              tracking-[0.08em]
              text-[var(--color-text-secondary)]
            "
          >
            {nft.collection}
          </p>

          <h1
            className="
              mt-[8px]
              text-[28px]
              font-bold
              leading-[34px]
              text-[var(--color-foreground-kurio)]
            "
          >
            {nft.name}
          </h1>

          <div
            className="
              mt-[12px]
              flex
              flex-wrap
              items-center
              gap-x-[16px]
              gap-y-[8px]
            "
          >
            <span
              className="
                text-[20px]
                font-bold
                leading-[24px]
                text-[var(--color-text-accent)]
              "
            >
              {nft.priceEth}{' '}
              ETH
            </span>

            <span
              aria-label="Avaliação 5 de 5 estrelas"
              className="
                text-[13px]
                tracking-[0.05em]
                text-[var(--color-primary-kurio)]
              "
            >
              ★★★★★
            </span>

            <button
              type="button"
              onClick={
                handleReviewsClick
              }
              className="
                text-[12px]
                font-normal
                leading-[18px]
                text-[var(--color-text-secondary)]
                transition-colors
                hover:text-[var(--color-text-accent)]
              "
            >
              19 avaliações de
              colecionadores
            </button>
          </div>
        </div>
      </div>

      <div
        className="
          mt-[24px]
        "
      >
        <h2
          className="
            text-[14px]
            font-bold
            leading-[18px]
            text-[var(--color-foreground-kurio)]
          "
        >
          Sobre este NFT
        </h2>

        <p
          className="
            mt-[8px]
            max-w-[520px]
            text-[14px]
            font-normal
            leading-[22px]
            text-[var(--color-text-secondary)]
          "
        >
          Um colecionável digital
          finalizado à mão da coleção{' '}
          <span
            className="
              text-[var(--color-foreground-kurio)]
            "
          >
            {nft.collection}
          </span>
          , verificado na rede{' '}
          <span
            className="
              text-[var(--color-foreground-kurio)]
            "
          >
            {formatNetwork(
              nft.network,
            )}
          </span>{' '}
          e disponibilizado em edição
          limitada.
        </p>
      </div>

      <div
        className="
          mt-[20px]
          border-y
          border-[var(--color-border-kurio)]
          py-[16px]
        "
      >
        <div
          className="
            flex
            items-end
            justify-between
          "
        >
          <div>
            <p
              className="
                text-[13px]
                font-bold
                leading-[18px]
                text-[var(--color-foreground-kurio)]
              "
            >
              Edição
            </p>

            <p
              className="
                mt-[4px]
                text-[12px]
                font-normal
                leading-[18px]
                text-[var(--color-text-secondary)]
              "
            >
              {isSoldOut
                ? 'Edição esgotada'
                : `${nft.availableQuantity} disponíveis`}
            </p>
          </div>

          {!isSoldOut && (
            <p
              className="
                text-[12px]
                leading-[18px]
                text-[var(--color-text-secondary)]
              "
            >
              {quantityInCart >
              0
                ? `${quantityInCart} no carrinho`
                : 'Edição limitada'}
            </p>
          )}
        </div>
      </div>

      <div
        className="
          mt-[20px]
        "
      >
        <p
          className="
            mb-[10px]
            text-[13px]
            font-bold
            leading-[18px]
            text-[var(--color-foreground-kurio)]
          "
        >
          Quantidade
        </p>

        <div
          className="
            flex
            items-center
            gap-[10px]
          "
        >
          <div
            className="
              flex
              h-[40px]
              items-center
              overflow-hidden
              rounded-[6px]
              border
              border-[var(--color-border-kurio)]
              bg-[var(--color-surface-card)]
            "
          >
            <button
              type="button"
              onClick={
                handleDecreaseQuantity
              }
              disabled={
                isMinimumQuantity ||
                isSoldOut ||
                cannotAddMore
              }
              aria-label="Diminuir quantidade"
              className="
                flex
                h-full
                w-[40px]
                items-center
                justify-center
                text-[var(--color-foreground-kurio)]
                transition-colors
                hover:bg-[var(--color-border-kurio)]
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <Minus
                size={16}
                strokeWidth={
                  2
                }
              />
            </button>

            <span
              aria-live="polite"
              className="
                flex
                h-full
                min-w-[44px]
                items-center
                justify-center
                border-x
                border-[var(--color-border-kurio)]
                text-[14px]
                font-bold
                text-[var(--color-foreground-kurio)]
              "
            >
              {cannotAddMore
                ? 0
                : quantity}
            </span>

            <button
              type="button"
              onClick={
                handleIncreaseQuantity
              }
              disabled={
                isMaximumQuantity ||
                isSoldOut ||
                cannotAddMore
              }
              aria-label="Aumentar quantidade"
              className="
                flex
                h-full
                w-[40px]
                items-center
                justify-center
                text-[var(--color-foreground-kurio)]
                transition-colors
                hover:bg-[var(--color-border-kurio)]
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <Plus
                size={16}
                strokeWidth={
                  2
                }
              />
            </button>
          </div>

          <div
            className="
              ml-auto
              flex
              gap-[12px]
            "
          >
            <button
              type="button"
              onClick={
                handleAddToCart
              }
              disabled={
                isSoldOut ||
                cannotAddMore
              }
              className="
                h-[40px]
                min-w-[128px]
                rounded-[6px]
                bg-[var(--color-primary-kurio)]
                px-[22px]
                text-[14px]
                font-bold
                leading-[18px]
                text-[var(--color-ink)]
                transition-opacity
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {isSoldOut
                ? 'ESGOTADO'
                : cannotAddMore
                  ? 'NO CARRINHO'
                  : 'COMPRAR'}
            </button>

            <button
              type="button"
              onClick={
                handleToggleFavorite
              }
              aria-pressed={
                favorite
              }
              aria-label={
                favorite
                  ? `Remover ${nft.name} dos favoritos`
                  : `Adicionar ${nft.name} aos favoritos`
              }
              className="
                flex
                h-[40px]
                min-w-[120px]
                items-center
                justify-center
                gap-[7px]
                rounded-[6px]
                border
                border-[var(--color-primary-kurio)]
                px-[16px]
                text-[13px]
                font-bold
                text-[var(--color-text-accent)]
                transition-colors
                hover:bg-[var(--color-primary-kurio)]/10
              "
            >
              <Heart
                size={16}
                strokeWidth={
                  2
                }
                fill={
                  favorite
                    ? 'currentColor'
                    : 'none'
                }
              />

              {favorite
                ? 'Favoritado'
                : 'Favoritar'}
            </button>
          </div>
        </div>
      </div>

      {wasAddedToCart && (
        <p
          role="status"
          className="
            mt-[10px]
            text-[12px]
            font-medium
            leading-[18px]
            text-[var(--color-text-accent)]
          "
        >
          Item adicionado ao carrinho.
        </p>
      )}

      <div
        className="
          mt-[24px]
          space-y-[8px]
          border-t
          border-[var(--color-border-kurio)]
          pt-[18px]
          text-[12px]
          font-normal
          leading-[18px]
          text-[var(--color-text-secondary)]
        "
      >
        <p>
          ID do token:{' '}
          <span
            className="
              text-[var(--color-foreground-kurio)]
            "
          >
            {nft.tokenId}
          </span>
        </p>

        <p>
          Coleção:{' '}
          <span
            className="
              text-[var(--color-foreground-kurio)]
            "
          >
            {nft.collection}
          </span>
        </p>

        <p>
          Rede:{' '}
          <span
            className="
              text-[var(--color-foreground-kurio)]
            "
          >
            {formatNetwork(
              nft.network,
            )}
          </span>
        </p>

        <p>
          Categoria:{' '}
          <span
            className="
              text-[var(--color-foreground-kurio)]
            "
          >
            {nft.category}
          </span>
        </p>

        <button
          type="button"
          onClick={() =>
            void handleShare()
          }
          className="
            flex
            items-center
            gap-[6px]
            pt-[2px]
            text-[12px]
            font-medium
            text-[var(--color-text-accent)]
            transition-opacity
            hover:opacity-70
          "
        >
          <Share2
            size={14}
          />

          {wasLinkCopied
            ? 'Link copiado'
            : 'Compartilhar este NFT'}
        </button>
      </div>
    </div>
  )
}