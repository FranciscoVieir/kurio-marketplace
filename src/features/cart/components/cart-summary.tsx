import { useMemo, useState } from 'react'
import Decimal from 'decimal.js'

import { useCart } from '@/features/cart/hooks/use-cart'
import { calculateCartSubtotal } from '@/features/cart/lib/cart-calculations'

const NETWORK_FEE_ETH = '0.016'

const PROMOTIONAL_CODES: Record<string, string> = {
  KURIO10: '0.10',
}

export function CartSummary() {
  const {
    items,
    isEmpty,
  } = useCart()

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] =
    useState<string | null>(null)
  const [couponError, setCouponError] =
    useState<string | null>(null)

  const subtotal = useMemo(
    () => new Decimal(calculateCartSubtotal(items)),
    [items],
  )

  const discountRate = useMemo(() => {
    if (!appliedCoupon) {
      return new Decimal(0)
    }

    return new Decimal(
      PROMOTIONAL_CODES[appliedCoupon] ?? 0,
    )
  }, [appliedCoupon])

  const discount = useMemo(
    () =>
      subtotal
        .mul(discountRate)
        .toDecimalPlaces(3),
    [subtotal, discountRate],
  )

  const networkFee = useMemo(
    () =>
      isEmpty
        ? new Decimal(0)
        : new Decimal(NETWORK_FEE_ETH),
    [isEmpty],
  )

  const total = useMemo(
    () =>
      subtotal
        .minus(discount)
        .plus(networkFee),
    [
      subtotal,
      discount,
      networkFee,
    ],
  )

  function handleApplyCoupon() {
    const normalizedCode = couponCode
      .trim()
      .toUpperCase()

    if (!normalizedCode) {
      setAppliedCoupon(null)
      setCouponError(
        'Digite um código promocional.',
      )
      return
    }

    if (!PROMOTIONAL_CODES[normalizedCode]) {
      setAppliedCoupon(null)
      setCouponError(
        'Código promocional inválido.',
      )
      return
    }

    setAppliedCoupon(normalizedCode)
    setCouponCode(normalizedCode)
    setCouponError(null)
  }

  return (
    <aside className="min-w-0">
      <h2
        className="
          border-b
          border-[var(--color-border-kurio)]
          pb-[8px]
          text-[12px] font-bold
          text-foreground
        "
      >
        Resumo da carteira
      </h2>

      <div className="mt-[14px]">
        <label
          htmlFor="coupon-code"
          className="
            block
            text-[10px]
            text-foreground
          "
        >
          Código promocional
        </label>

        <div className="mt-[6px] flex">
          <input
            id="coupon-code"
            type="text"
            value={couponCode}
            onChange={(event) => {
              setCouponCode(
                event.target.value,
              )

              if (couponError) {
                setCouponError(null)
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleApplyCoupon()
              }
            }}
            placeholder="Digite o código promocional..."
            className="
              h-[32px] min-w-0 flex-1
              border
              border-[var(--color-border-kurio)]
              bg-transparent
              px-[9px]
              text-[10px]
              text-foreground
              outline-none
              placeholder:text-[var(--color-text-secondary)]
              focus:border-[var(--color-primary-kurio)]
            "
          />

          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={isEmpty}
            className="
              h-[32px]
              bg-[var(--color-primary-kurio)]
              px-[14px]
              text-[10px] font-bold
              text-[var(--color-ink)]
              transition-opacity
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Aplicar
          </button>
        </div>

        {couponError && (
          <p
            role="alert"
            className="
              mt-[5px]
              text-[9px]
              text-destructive
            "
          >
            {couponError}
          </p>
        )}

        {appliedCoupon && (
          <p
            role="status"
            className="
              mt-[5px]
              text-[9px]
              text-[var(--color-text-accent)]
            "
          >
            {appliedCoupon} aplicado: 10% de desconto.
          </p>
        )}
      </div>

      <div
        className="
          mt-[18px] space-y-[10px]
          text-[10px]
        "
      >
        <div className="flex items-center justify-between gap-[20px]">
          <span className="text-foreground">
            Subtotal
          </span>

          <span className="text-foreground">
            {subtotal.toFixed(2)} ETH
          </span>
        </div>

        <div className="flex items-center justify-between gap-[20px]">
          <span className="text-foreground">
            Desconto do lançamento
          </span>

          <span className="text-foreground">
            (-) {discount.toFixed(2)} ETH
          </span>
        </div>

        <div className="flex items-center justify-between gap-[20px]">
          <span className="text-foreground">
            Taxa de rede
          </span>

          <span className="text-foreground">
            {networkFee.toFixed(3)} ETH
          </span>
        </div>

        <p
          className="
            text-right
            text-[8px]
            text-[var(--color-text-accent)]
          "
        >
          Taxa estimada
        </p>
      </div>

      <div
        className="
          mt-[16px]
          flex items-center justify-between
          border-t
          border-[var(--color-border-kurio)]
          pt-[12px]
        "
      >
        <span className="text-[11px] font-bold text-foreground">
          Total
        </span>

        <span
          className="
            text-[12px] font-bold
            text-[var(--color-text-accent)]
          "
        >
          {total.toFixed(3)} ETH
        </span>
      </div>

      <button
        type="button"
        disabled={isEmpty}
        className="
          mt-[16px]
          h-[36px] w-full
          rounded-[2px]
          bg-[var(--color-primary-kurio)]
          text-[11px] font-bold
          text-[var(--color-ink)]
          transition-opacity
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        Conectar e finalizar
      </button>

      <button
        type="button"
        className="
          mt-[10px]
          w-full
          text-center
          text-[10px]
          text-[var(--color-text-accent)]
        "
      >
        Continuar explorando
      </button>
    </aside>
  )
}