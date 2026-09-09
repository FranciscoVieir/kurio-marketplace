import { useState } from 'react'
import { Heart, Minus, Plus } from 'lucide-react'

import { useCart } from '@/features/cart/hooks/use-cart'
import { useFavorites } from '@/features/favorites/hooks/use-favorites'
import type { Nft } from '@/features/nft/types/nft'

type NftPurchasePanelProps = {
  nft: Nft
}

export function NftPurchasePanel({
  nft,
}: NftPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1)
  const [wasAddedToCart, setWasAddedToCart] = useState(false)

  const {
    isFavorite,
    toggleFavorite,
  } = useFavorites()

  const {
    addItem,
    getItemQuantity,
  } = useCart()

  const favorite = isFavorite(nft.id)
  const quantityInCart = getItemQuantity(nft.id)

  const isMinimumQuantity = quantity <= 1

  const remainingQuantity = Math.max(
    0,
    nft.availableQuantity - quantityInCart,
  )

  const isMaximumQuantity =
    quantity >= remainingQuantity

  const isSoldOut = nft.availableQuantity <= 0

  const cannotAddMore =
    remainingQuantity <= 0

  function handleDecreaseQuantity() {
    setQuantity((currentQuantity) =>
      Math.max(1, currentQuantity - 1),
    )

    setWasAddedToCart(false)
  }

  function handleIncreaseQuantity() {
    setQuantity((currentQuantity) =>
      Math.min(
        remainingQuantity,
        currentQuantity + 1,
      ),
    )

    setWasAddedToCart(false)
  }

  function handleToggleFavorite() {
    toggleFavorite(nft.id)
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

    setWasAddedToCart(true)
    setQuantity(1)
  }

  return (
    <div className="min-w-0 flex-1 pl-[8px]">
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="
              text-[24px] font-bold
              leading-[28px]
              text-foreground
            "
          >
            {nft.name}
          </h1>

          <div className="mt-[8px] flex items-center gap-[16px]">
            <span
              className="
                text-[18px] font-bold
                text-[var(--color-text-accent)]
              "
            >
              {nft.priceEth} ETH
            </span>

            <span
              className="
                text-[12px]
                text-[var(--color-primary-kurio)]
              "
            >
              ★★★★★
            </span>

            <span className="text-[11px] text-muted-foreground">
              19 avaliações de colecionadores
            </span>
          </div>
        </div>
      </div>

      <div className="mt-[20px]">
        <h2 className="text-[13px] font-bold text-foreground">
          Sobre este NFT:
        </h2>

        <p
          className="
            mt-[6px] max-w-[520px]
            text-[12px] font-normal
            leading-[20px]
            text-[var(--color-text-secondary)]
          "
        >
          Um colecionável digital finalizado à mão da coleção{' '}
          {nft.collection}, verificado na rede {nft.network} e
          disponibilizado em edição limitada.
        </p>
      </div>

      <div className="mt-[12px]">
        <p className="text-[12px] font-bold text-foreground">
          Edição:
        </p>

        <p className="mt-[4px] text-[11px] text-muted-foreground">
          1 / {nft.availableQuantity}
        </p>
      </div>

      <div className="mt-[18px] flex items-center gap-[8px]">
        <button
          type="button"
          onClick={handleDecreaseQuantity}
          disabled={
            isMinimumQuantity ||
            isSoldOut ||
            cannotAddMore
          }
          aria-label="Diminuir quantidade"
          className="
            flex h-[36px] w-[36px]
            items-center justify-center
            rounded-full
            bg-[var(--color-primary-kurio)]
            text-[var(--color-ink)]
            transition-opacity
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <Minus
            size={17}
            strokeWidth={2.4}
          />
        </button>

        <span
          aria-live="polite"
          className="
            flex h-[36px] min-w-[28px]
            items-center justify-center
            text-[14px] font-bold
            text-foreground
          "
        >
          {cannotAddMore ? 0 : quantity}
        </span>

        <button
          type="button"
          onClick={handleIncreaseQuantity}
          disabled={
            isMaximumQuantity ||
            isSoldOut ||
            cannotAddMore
          }
          aria-label="Aumentar quantidade"
          className="
            flex h-[36px] w-[36px]
            items-center justify-center
            rounded-full
            bg-[var(--color-primary-kurio)]
            text-[var(--color-ink)]
            transition-opacity
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <Plus
            size={17}
            strokeWidth={2.4}
          />
        </button>

        <div className="ml-auto flex gap-[12px]">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              isSoldOut ||
              cannotAddMore
            }
            className="
              h-[36px] min-w-[110px]
              rounded-[6px]
              bg-[var(--color-primary-kurio)]
              px-[20px]
              text-[13px] font-bold
              text-[var(--color-ink)]
              transition-opacity
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
            onClick={handleToggleFavorite}
            aria-pressed={favorite}
            aria-label={
              favorite
                ? `Remover ${nft.name} dos favoritos`
                : `Adicionar ${nft.name} aos favoritos`
            }
            className="
              flex h-[36px] min-w-[110px]
              items-center justify-center
              gap-[6px]
              rounded-[6px]
              border border-[var(--color-primary-kurio)]
              px-[16px]
              text-[12px] font-bold
              text-[var(--color-text-accent)]
            "
          >
            <Heart
              size={15}
              strokeWidth={2}
              fill={favorite ? 'currentColor' : 'none'}
            />

            {favorite
              ? 'Favoritado'
              : 'Favoritar'}
          </button>
        </div>
      </div>

      {quantityInCart > 0 && (
        <p
          className="
            mt-[8px]
            text-[11px]
            text-[var(--color-text-secondary)]
          "
        >
          {quantityInCart}{' '}
          {quantityInCart === 1
            ? 'item está'
            : 'itens estão'}{' '}
          no carrinho.
        </p>
      )}

      {wasAddedToCart && !cannotAddMore && (
        <p
          role="status"
          className="
            mt-[6px]
            text-[11px]
            text-[var(--color-text-accent)]
          "
        >
          Item adicionado ao carrinho.
        </p>
      )}

      <div
        className="
          mt-[18px] space-y-[6px]
          text-[11px]
          text-[var(--color-text-secondary)]
        "
      >
        <p>
          ID do token:{' '}
          <span className="text-foreground">
            {nft.tokenId}
          </span>
        </p>

        <p>
          Coleção:{' '}
          <span className="text-foreground">
            {nft.collection}
          </span>
        </p>

        <p>
          Atributos:{' '}
          <span className="text-foreground">
            {nft.category}, {nft.network}
          </span>
        </p>

        <p>
          Compartilhar este NFT: in ↗
        </p>
      </div>
    </div>
  )
}