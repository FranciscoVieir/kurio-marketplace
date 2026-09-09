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
    <div className="min-w-0">
      <div
        className="
          grid grid-cols-[1fr_90px_110px_90px_28px]
          items-center gap-[18px]
          border-b border-[var(--color-border-kurio)]
          pb-[8px]
          text-[11px]
          text-foreground
        "
      >
        <span>NFTs</span>
        <span>Preço</span>
        <span>Edições</span>
        <span>Total</span>
        <span aria-hidden="true" />
      </div>

      <div className="mt-[8px] space-y-[8px]">
        {items.map((item) => {
          const isMinimumQuantity =
            item.quantity <= 1

          const isMaximumQuantity =
            item.quantity >=
            item.availableQuantity

          const itemTotal =
            calculateCartItemTotal(item)

          return (
            <article
              key={item.nftId}
              className="
                grid min-h-[76px]
                grid-cols-[1fr_90px_110px_90px_28px]
                items-center gap-[18px]
                bg-[var(--color-surface-card)]
                px-[12px] py-[8px]
              "
            >
              <div className="flex min-w-0 items-center gap-[10px]">
                <div
                  className="
                    h-[52px] w-[52px]
                    shrink-0 overflow-hidden
                    rounded-[4px]
                    bg-background
                  "
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="
                      h-full w-full
                      object-cover
                    "
                  />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-[11px] font-bold
                      text-foreground
                    "
                  >
                    {item.name}
                  </p>

                  <p
                    className="
                      mt-[4px]
                      truncate
                      text-[9px]
                      text-[var(--color-text-secondary)]
                    "
                  >
                    ID do token: {item.nftId}
                  </p>
                </div>
              </div>

              <div
                className="
                  text-[11px] font-bold
                  text-[var(--color-text-accent)]
                "
              >
                {item.priceEth} ETH
              </div>

              <div className="flex items-center gap-[8px]">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(
                      item.nftId,
                      item.quantity - 1,
                    )
                  }
                  disabled={isMinimumQuantity}
                  aria-label={`Diminuir quantidade de ${item.name}`}
                  className="
                    flex h-[22px] w-[22px]
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
                    size={12}
                    strokeWidth={2.5}
                  />
                </button>

                <span
                  aria-live="polite"
                  className="
                    min-w-[14px]
                    text-center
                    text-[11px] font-bold
                    text-foreground
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
                  disabled={isMaximumQuantity}
                  aria-label={`Aumentar quantidade de ${item.name}`}
                  className="
                    flex h-[22px] w-[22px]
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
                    size={12}
                    strokeWidth={2.5}
                  />
                </button>
              </div>

              <div
                className="
                  text-[11px] font-bold
                  text-[var(--color-text-accent)]
                "
              >
                {itemTotal} ETH
              </div>

              <button
                type="button"
                onClick={() =>
                  removeItem(item.nftId)
                }
                aria-label={`Remover ${item.name} do carrinho`}
                className="
                  flex h-[24px] w-[24px]
                  items-center justify-center
                  text-[var(--color-text-secondary)]
                  transition-colors
                  hover:text-[var(--color-text-accent)]
                "
              >
                <Trash2
                  size={14}
                  strokeWidth={1.8}
                />
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}