import { Link } from '@tanstack/react-router'

import {
  Minus,
  Plus,
  Trash2,
} from 'lucide-react'

import { useCart } from '@/features/cart/hooks/use-cart'
import { calculateCartItemTotal } from '@/features/cart/lib/cart-calculations'

export function CartItemsList() {
  const {
    items,
    updateQuantity,
    removeItem,
  } = useCart()

  return (
    <div
      className="
        min-w-0

        max-md:w-full
      "
    >
      {/* MOBILE */}
      <div
        className="
          hidden

          max-md:block
          max-md:w-full
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[358px]
            space-y-[16px]
          "
        >
          {items.map((item) => {
            const isMinimumQuantity =
              item.quantity <= 1

            const isMaximumQuantity =
              item.quantity >=
              item.availableQuantity

            return (
              <article
                key={item.nftId}
                className="
                  relative
                  h-[100px]
                  w-full
                  overflow-hidden
                  rounded-[14px]
                  bg-[var(--color-surface-card)]
                "
              >
                {/* Imagem */}
                <Link
                  to="/nft/$nftId"
                  params={{
                    nftId: item.nftId,
                  }}
                  aria-label={`Abrir ${item.name}`}
                  className="
                    absolute
                    left-[1px]
                    top-0
                    h-[100px]
                    w-[100px]
                    overflow-hidden
                    rounded-[14px]
                    bg-background
                  "
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />
                </Link>

                {/* Nome */}
                <Link
                  to="/nft/$nftId"
                  params={{
                    nftId: item.nftId,
                  }}
                  className="
                    absolute
                    left-[109px]
                    top-[13px]
                    block
                    max-w-[145px]
                    truncate
                    text-[15px]
                    font-bold
                    leading-[16px]
                    text-[var(--color-foreground-kurio)]
                  "
                >
                  {item.name}
                </Link>

                {/* Edição */}
                <p
                  className="
                    absolute
                    left-[109px]
                    top-[35px]
                    max-w-[145px]
                    truncate
                    text-[14px]
                    font-normal
                    leading-[16px]
                    text-[var(--color-text-secondary)]
                  "
                >
                  Edição: 1/
                  {item.availableQuantity}
                </p>

                {/* Preço */}
                <p
                  className="
                    absolute
                    left-[109px]
                    top-[69px]
                    text-[18px]
                    font-bold
                    leading-[16px]
                    text-[var(--color-text-accent)]
                  "
                >
                  {item.priceEth} ETH
                </p>

                {/* Quantidade */}
                <div
                  className="
                    absolute
                    right-[12px]
                    top-[38px]
                    flex
                    h-[24px]
                    items-center
                    gap-[8px]
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.nftId,
                        item.quantity - 1,
                      )
                    }
                    disabled={
                      isMinimumQuantity
                    }
                    aria-label={`Diminuir quantidade de ${item.name}`}
                    className="
                      flex
                      h-[24px]
                      w-[24px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-[31px]
                      border
                      border-[var(--color-border-kurio)]
                      bg-[var(--color-surface-raised)]
                      text-[var(--color-foreground-kurio)]
                      transition-opacity
                      active:opacity-70
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <Minus
                      size={12}
                      strokeWidth={2}
                    />
                  </button>

                  <span
                    aria-live="polite"
                    className="
                      min-w-[12px]
                      text-center
                      text-[14px]
                      font-normal
                      leading-[16px]
                      text-[var(--color-foreground-kurio)]
                    "
                  >
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.nftId,
                        item.quantity + 1,
                      )
                    }
                    disabled={
                      isMaximumQuantity
                    }
                    aria-label={`Aumentar quantidade de ${item.name}`}
                    className="
                      flex
                      h-[24px]
                      w-[24px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-[31px]
                      border
                      border-[var(--color-border-kurio)]
                      bg-[var(--color-surface-raised)]
                      text-[var(--color-foreground-kurio)]
                      transition-opacity
                      active:opacity-70
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <Plus
                      size={12}
                      strokeWidth={2}
                    />
                  </button>
                </div>

                {/* Remover */}
                <button
                  type="button"
                  onClick={() =>
                    removeItem(
                      item.nftId,
                    )
                  }
                  aria-label={`Remover ${item.name} do carrinho`}
                  className="
                    absolute
                    bottom-[7px]
                    right-[12px]
                    flex
                    h-[22px]
                    w-[22px]
                    items-center
                    justify-center
                    rounded-full
                    text-[var(--color-text-secondary)]
                    transition-colors
                    active:text-[var(--color-text-accent)]
                  "
                >
                  <Trash2
                    size={14}
                    strokeWidth={1.7}
                  />
                </button>
              </article>
            )
          })}
        </div>
      </div>

      {/* DESKTOP */}
      <div
        className="
          max-md:hidden
        "
      >
        <div
          className="
            grid
            grid-cols-[minmax(0,1fr)_100px_130px_100px_32px]
            items-center
            gap-[20px]
            border-b
            border-[var(--color-border-kurio)]
            pb-[10px]
            text-[12px]
            font-medium
            leading-[16px]
            text-[var(--color-foreground-kurio)]
          "
        >
          <span>NFTs</span>
          <span>Preço</span>
          <span>Edições</span>
          <span>Total</span>
          <span aria-hidden="true" />
        </div>

        <div
          className="
            mt-[10px]
            space-y-[10px]
          "
        >
          {items.map((item) => {
            const isMinimumQuantity =
              item.quantity <= 1

            const isMaximumQuantity =
              item.quantity >=
              item.availableQuantity

            const itemTotal =
              calculateCartItemTotal(
                item,
              )

            return (
              <article
                key={item.nftId}
                className="
                  grid
                  min-h-[92px]
                  grid-cols-[minmax(0,1fr)_100px_130px_100px_32px]
                  items-center
                  gap-[20px]
                  rounded-[8px]
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]
                  px-[14px]
                  py-[10px]
                "
              >
                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-[12px]
                  "
                >
                  <Link
                    to="/nft/$nftId"
                    params={{
                      nftId:
                        item.nftId,
                    }}
                    className="
                      group
                      shrink-0
                    "
                    aria-label={`Abrir ${item.name}`}
                  >
                    <div
                      className="
                        h-[64px]
                        w-[64px]
                        overflow-hidden
                        rounded-[6px]
                        bg-background
                      "
                    >
                      <img
                        src={
                          item.imageUrl
                        }
                        alt={
                          item.name
                        }
                        loading="lazy"
                        className="
                          h-full
                          w-full
                          object-cover
                          transition-transform
                          duration-300
                          group-hover:scale-[1.04]
                        "
                      />
                    </div>
                  </Link>

                  <div
                    className="
                      min-w-0
                    "
                  >
                    <Link
                      to="/nft/$nftId"
                      params={{
                        nftId:
                          item.nftId,
                      }}
                      className="
                        block
                        truncate
                        text-[13px]
                        font-bold
                        leading-[18px]
                        text-[var(--color-foreground-kurio)]
                        transition-colors
                        hover:text-[var(--color-text-accent)]
                      "
                    >
                      {
                        item.name
                      }
                    </Link>

                    <p
                      className="
                        mt-[5px]
                        truncate
                        text-[11px]
                        font-normal
                        leading-[16px]
                        text-[var(--color-text-secondary)]
                      "
                    >
                      ID do token:{' '}
                      {
                        item.nftId
                      }
                    </p>
                  </div>
                </div>

                <div
                  className="
                    text-[13px]
                    font-bold
                    leading-[18px]
                    text-[var(--color-text-accent)]
                  "
                >
                  {
                    item.priceEth
                  }{' '}
                  ETH
                </div>

                <div
                  className="
                    flex
                    items-center
                  "
                >
                  <div
                    className="
                      flex
                      h-[34px]
                      items-center
                      overflow-hidden
                      rounded-[6px]
                      border
                      border-[var(--color-border-kurio)]
                      bg-[var(--color-ink)]
                    "
                  >
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.nftId,
                          item.quantity -
                            1,
                        )
                      }
                      disabled={
                        isMinimumQuantity
                      }
                      aria-label={`Diminuir quantidade de ${item.name}`}
                      className="
                        flex
                        h-full
                        w-[34px]
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
                        size={14}
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
                        min-w-[36px]
                        items-center
                        justify-center
                        border-x
                        border-[var(--color-border-kurio)]
                        text-[13px]
                        font-bold
                        text-[var(--color-foreground-kurio)]
                      "
                    >
                      {
                        item.quantity
                      }
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.nftId,
                          item.quantity +
                            1,
                        )
                      }
                      disabled={
                        isMaximumQuantity
                      }
                      aria-label={`Aumentar quantidade de ${item.name}`}
                      className="
                        flex
                        h-full
                        w-[34px]
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
                        size={14}
                        strokeWidth={
                          2
                        }
                      />
                    </button>
                  </div>
                </div>

                <div
                  className="
                    text-[13px]
                    font-bold
                    leading-[18px]
                    text-[var(--color-text-accent)]
                  "
                >
                  {itemTotal} ETH
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeItem(
                      item.nftId,
                    )
                  }
                  aria-label={`Remover ${item.name} do carrinho`}
                  className="
                    flex
                    h-[32px]
                    w-[32px]
                    items-center
                    justify-center
                    rounded-[6px]
                    text-[var(--color-text-secondary)]
                    transition-colors
                    hover:bg-[var(--color-ink)]
                    hover:text-[var(--color-text-accent)]
                  "
                >
                  <Trash2
                    size={16}
                    strokeWidth={
                      1.8
                    }
                  />
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}