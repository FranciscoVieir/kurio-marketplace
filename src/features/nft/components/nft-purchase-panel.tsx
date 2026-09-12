import {
  useState,
} from 'react'

import {
  Heart,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
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

  const mobileDescription =
    nft.description ??
    `Um colecionável digital finalizado à mão da coleção ${nft.collection}, verificado na ${formatNetwork(
      nft.network,
    )}.`

  /*
   * Fallback temporário para o banco mock antigo
   * que pode continuar salvo no localStorage.
   *
   * Quando rating/reviewCount existirem no NFT,
   * os dados reais sempre terão prioridade.
   */
  const mobileRating =
    nft.rating ?? 4.8

  const mobileReviewCount =
    nft.reviewCount ?? 19

  const mobileEditionStatus =
    isSoldOut ||
    nft.edition?.status ===
      'closed'
      ? 'FECHADA'
      : 'ABERTA'

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

  async function handleAddToCart() {
    if (
      isSoldOut ||
      cannotAddMore ||
      quantity <= 0
    ) {
      return
    }

    setWasAddedToCart(
      false,
    )

    const wasAdded =
      await addItem({
        nft,
        quantity,
      })

    if (!wasAdded) {
      return
    }

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
    <>
      {/* MOBILE */}
      <div
        className="
          hidden

          max-md:relative
          max-md:z-20
          max-md:mx-auto
          max-md:mt-0
          max-md:block
          max-md:w-full
          max-md:max-w-[366px]
          max-md:rounded-[24px]
          max-md:bg-[var(--color-surface-card)]
          max-md:px-[16px]
          max-md:pb-[24px]
          max-md:pt-[24px]
        "
      >
        {/* Título + avaliação */}
        <div
          className="
            flex
            h-[27px]
            w-full
            items-center
            justify-between
          "
        >
          <h1
            className="
              min-w-0
              truncate
              text-[20px]
              font-bold
              leading-[16px]
              text-[var(--color-foreground-kurio)]
            "
          >
            {nft.name}
          </h1>

          <div
            aria-label={`Avaliação ${mobileRating.toFixed(1)} de 5, ${mobileReviewCount} avaliações`}
            className="
              ml-[12px]
              flex
              h-[27px]
              w-[83px]
              shrink-0
              items-center
              justify-center
              gap-[4px]
              rounded-[32px]
              border
              border-[var(--color-primary-kurio)]
              text-[12px]
              font-normal
              leading-[16px]
              text-[var(--color-foreground-kurio)]
            "
          >
            <span
              aria-hidden="true"
              className="
                text-[12px]
                text-[var(--color-primary-kurio)]
              "
            >
              ★
            </span>

            <span>
              {mobileRating.toFixed(
                1,
              )}{' '}
              ({mobileReviewCount})
            </span>
          </div>
        </div>

        {/* Descrição */}
        <p
          className="
            mt-[14px]
            w-full
            text-[14px]
            font-normal
            leading-[24px]
            text-[var(--color-text-secondary)]
          "
        >
          {mobileDescription}
        </p>

        {/* Edição */}
        <div
          className="
            mt-[12px]
          "
        >
          <p
            className="
              text-[15px]
              font-bold
              leading-[16px]
              text-[var(--color-foreground-kurio)]
            "
          >
            Edição:
          </p>

          <div
            className="
              mt-[8px]
              flex
              h-[28px]
              items-center
              gap-[12px]
            "
          >
            {nft.edition ? (
              <>
                <span
                  className="
                    flex
                    h-[24px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[var(--color-border-kurio)]
                    px-[6px]
                    text-[12px]
                    font-normal
                    leading-[16px]
                    text-[var(--color-text-secondary)]
                  "
                >
                  {
                    nft.edition
                      .current
                  }
                  /
                  {
                    nft.edition
                      .total
                  }
                </span>

                {nft.edition
                  .collectionCurrent !==
                  undefined &&
                  nft.edition
                    .collectionTotal !==
                    undefined && (
                    <span
                      className="
                        flex
                        h-[24px]
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[var(--color-border-kurio)]
                        px-[6px]
                        text-[12px]
                        font-normal
                        leading-[16px]
                        text-[var(--color-text-secondary)]
                      "
                    >
                      {
                        nft.edition
                          .collectionCurrent
                      }
                      /
                      {
                        nft.edition
                          .collectionTotal
                      }
                    </span>
                  )}

                {nft.edition
                  .rarityCurrent !==
                  undefined &&
                  nft.edition
                    .rarityTotal !==
                    undefined && (
                    <span
                      className="
                        flex
                        h-[24px]
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[var(--color-primary-kurio)]
                        px-[6px]
                        text-[12px]
                        font-bold
                        leading-[16px]
                        text-[var(--color-text-accent)]
                      "
                    >
                      {
                        nft.edition
                          .rarityCurrent
                      }
                      /
                      {
                        nft.edition
                          .rarityTotal
                      }
                    </span>
                  )}

                <span
                  className="
                    flex
                    h-[24px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[var(--color-border-kurio)]
                    px-[7px]
                    text-[11px]
                    font-normal
                    leading-[16px]
                    text-[var(--color-text-secondary)]
                  "
                >
                  {
                    mobileEditionStatus
                  }
                </span>
              </>
            ) : (
              <>
                <span
                  className="
                    flex
                    h-[24px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[var(--color-border-kurio)]
                    px-[7px]
                    text-[12px]
                    font-normal
                    leading-[16px]
                    text-[var(--color-text-secondary)]
                  "
                >
                  1/
                  {
                    nft.availableQuantity
                  }
                </span>

                <span
                  className="
                    flex
                    h-[24px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[var(--color-border-kurio)]
                    px-[7px]
                    text-[11px]
                    font-normal
                    leading-[16px]
                    text-[var(--color-text-secondary)]
                  "
                >
                  {
                    mobileEditionStatus
                  }
                </span>
              </>
            )}
          </div>
        </div>

        {/* Informações do NFT */}
        <div
          className="
            mt-[12px]
            space-y-[12px]
            text-[15px]
            font-normal
            leading-[100%]
            text-[var(--color-text-accent)]
          "
        >
          <p>
            ID do token:{' '}
            {nft.tokenId}
          </p>

          <p>
            Coleção:{' '}
            {nft.collection}
          </p>

          {nft.attributes &&
            nft.attributes.length >
              0 && (
              <p>
                Atributos:{' '}
                {nft.attributes.join(
                  ', ',
                )}
              </p>
            )}
        </div>

        {/* Quantidade + preço + compra */}
        <div
          className="
            mt-[30px]
            flex
            h-[110px]
            w-full
            flex-col
            gap-[20px]
          "
        >
          {/* Quantidade + preço */}
          <div
            className="
              flex
              h-[30px]
              w-full
              items-center
              justify-between
            "
          >
            <div
              className="
                flex
                h-[30px]
                items-center
                gap-[8px]
              "
            >
              <span
                className="
                  text-[14px]
                  font-bold
                  leading-[16px]
                  text-[var(--color-text-secondary)]
                "
              >
                Qtd.
              </span>

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
                  h-[28px]
                  w-[28px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--color-primary-kurio)]
                  text-[var(--color-ink)]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <Minus
                  size={14}
                  strokeWidth={2}
                />
              </button>

              <span
                aria-live="polite"
                className="
                  min-w-[10px]
                  text-center
                  text-[14px]
                  font-bold
                  leading-[16px]
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
                  h-[28px]
                  w-[28px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--color-primary-kurio)]
                  text-[var(--color-ink)]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <Plus
                  size={14}
                  strokeWidth={2}
                />
              </button>
            </div>

            <span
              className="
                text-right
                text-[20px]
                font-bold
                leading-[16px]
                text-[var(--color-text-accent)]
              "
            >
              {nft.priceEth}{' '}
              ETH
            </span>
          </div>

          {/* Comprar + carrinho */}
          <div
            className="
              flex
              h-[60px]
              items-center
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
                flex
                h-[60px]
                w-[196px]
                items-center
                justify-center
                rounded-[40px]
                bg-[linear-gradient(93.21deg,#D28A4C_-3.96%,rgba(210,138,76,0.8)_121.97%)]
                text-[16px]
                font-bold
                leading-[20px]
                text-[var(--color-ink)]
                transition-opacity
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {isSoldOut
                ? 'Esgotado'
                : cannotAddMore
                  ? 'No carrinho'
                  : 'Comprar NFT'}
            </button>

            <button
              type="button"
              onClick={
                handleAddToCart
              }
              disabled={
                isSoldOut ||
                cannotAddMore
              }
              aria-label="Adicionar NFT ao carrinho"
              className="
                flex
                h-[60px]
                w-[60px]
                shrink-0
                items-center
                justify-center
                rounded-[40px]
                border
                border-[#3F2319]
                bg-[var(--color-surface-raised)]
                text-[var(--color-text-accent)]
                transition-opacity
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ShoppingCart
                size={20}
                strokeWidth={1.6}
              />
            </button>
          </div>
        </div>

        {wasAddedToCart && (
          <p
            role="status"
            className="
              mt-[12px]
              text-[12px]
              font-medium
              leading-[18px]
              text-[var(--color-text-accent)]
            "
          >
            Item adicionado ao
            carrinho.
          </p>
        )}
      </div>

      {/* DESKTOP */}
      <div
        className="
          min-w-0
          flex-1
          pl-[8px]

          max-md:hidden
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
                  strokeWidth={2}
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
                  strokeWidth={2}
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
                  strokeWidth={2}
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
            Item adicionado ao
            carrinho.
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
    </>
  )
}