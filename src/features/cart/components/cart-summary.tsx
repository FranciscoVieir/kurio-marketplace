import {
  useMemo,
  useState,
} from 'react'

import { Link } from '@tanstack/react-router'
import Decimal from 'decimal.js'

import {
  BadgeCheck,
  BadgePercent,
  X,
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { useCart } from '@/features/cart/hooks/use-cart'
import { calculateCartSubtotal } from '@/features/cart/lib/cart-calculations'

const NETWORK_FEE_ETH =
  '0.016'

const PROMOTIONAL_CODES: Record<
  string,
  string
> = {
  KURIO10: '0.10',
}

export function CartSummary() {
  const {
    items,
    isEmpty,
    couponCode:
      appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart()

  const [
    couponInput,
    setCouponInput,
  ] = useState(
    appliedCoupon ?? '',
  )

  const [
    couponError,
    setCouponError,
  ] = useState<string | null>(
    null,
  )

  const subtotal =
    useMemo(
      () =>
        new Decimal(
          calculateCartSubtotal(
            items,
          ),
        ),
      [items],
    )

  const discountRate =
    useMemo(
      () => {
        if (
          !appliedCoupon
        ) {
          return new Decimal(
            0,
          )
        }

        return new Decimal(
          PROMOTIONAL_CODES[
            appliedCoupon
          ] ?? 0,
        )
      },
      [appliedCoupon],
    )

  const discount =
    useMemo(
      () =>
        subtotal
          .mul(
            discountRate,
          )
          .toDecimalPlaces(
            3,
          ),
      [
        subtotal,
        discountRate,
      ],
    )

  const networkFee =
    useMemo(
      () =>
        isEmpty
          ? new Decimal(
              0,
            )
          : new Decimal(
              NETWORK_FEE_ETH,
            ),
      [isEmpty],
    )

  const total =
    useMemo(
      () =>
        subtotal
          .minus(
            discount,
          )
          .plus(
            networkFee,
          ),
      [
        subtotal,
        discount,
        networkFee,
      ],
    )

  function handleApplyCoupon() {
    const normalizedCode =
      couponInput
        .trim()
        .toUpperCase()

    if (
      !normalizedCode
    ) {
      setCouponError(
        'Digite um código promocional.',
      )

      return
    }

    if (
      !PROMOTIONAL_CODES[
        normalizedCode
      ]
    ) {
      setCouponError(
        'Código promocional inválido.',
      )

      return
    }

    applyCoupon(
      normalizedCode,
    )

    setCouponInput(
      normalizedCode,
    )

    setCouponError(
      null,
    )
  }

  function handleUseAvailableCoupon() {
    setCouponInput(
      'KURIO10',
    )

    setCouponError(
      null,
    )
  }

  function handleRemoveCoupon() {
    removeCoupon()

    setCouponInput(
      '',
    )

    setCouponError(
      null,
    )
  }

  function handleCouponInputChange(
    value: string,
  ) {
    setCouponInput(
      value,
    )

    if (
      appliedCoupon
    ) {
      removeCoupon()
    }

    if (
      couponError
    ) {
      setCouponError(
        null,
      )
    }
  }

  return (
    <aside
      className="
        min-w-0

        max-md:w-full
      "
    >
      {/* MOBILE */}
      <div
        className="
          hidden

          max-md:mx-auto
          max-md:block
          max-md:w-full
          max-md:max-w-[366px]
        "
      >
        {/* Cupom disponível */}
        {!appliedCoupon && (
          <div
            className="
              mb-[10px]
              flex
              items-center
              justify-between
              gap-[10px]
              px-[4px]
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-[8px]
              "
            >
              <div
                className="
                  flex
                  h-[26px]
                  w-[26px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--color-primary-kurio)]/12
                  text-[var(--color-text-accent)]
                "
              >
                <BadgePercent
                  size={14}
                  strokeWidth={1.8}
                />
              </div>

              <p
                className="
                  min-w-0
                  text-[11px]
                  font-normal
                  leading-[16px]
                  text-[var(--color-text-secondary)]
                "
              >
                Cupom disponível:{' '}
                <span
                  className="
                    font-bold
                    text-[var(--color-text-accent)]
                  "
                >
                  KURIO10
                </span>{' '}
                — 10% OFF
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleUseAvailableCoupon
              }
              disabled={
                isEmpty
              }
              className="
                shrink-0
                text-[11px]
                font-bold
                leading-[16px]
                text-[var(--color-text-accent)]
                underline
                underline-offset-[3px]
                transition-opacity
                active:opacity-70
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Usar
            </button>
          </div>
        )}

        {/* Input do cupom */}
        <div>
          <div
            className="
              flex
              h-[44px]
              w-full
              overflow-hidden
              rounded-[40px]
              border
              border-[var(--color-border-kurio)]
              bg-[var(--color-surface-card)]
              pl-[16px]
            "
          >
            <Input
              id="coupon-code-mobile"
              type="text"
              value={
                couponInput
              }
              onChange={(
                event,
              ) =>
                handleCouponInputChange(
                  event.target
                    .value,
                )
              }
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                  'Enter'
                ) {
                  handleApplyCoupon()
                }
              }}
              disabled={
                isEmpty
              }
              placeholder="Digite o código promocional..."
              autoComplete="off"
              className="
                h-[44px]
                min-w-0
                flex-1
                border-0
                bg-transparent
                p-0
                pr-[8px]
                text-[13px]
                font-normal
                leading-[22px]
                text-[var(--color-foreground-kurio)]
                shadow-none
                placeholder:text-[var(--color-text-secondary)]
                focus-visible:border-0
                focus-visible:ring-0
                focus-visible:ring-offset-0
              "
            />

            <button
              type="button"
              onClick={
                handleApplyCoupon
              }
              disabled={
                isEmpty
              }
              className="
                flex
                h-[44px]
                w-[88px]
                shrink-0
                items-center
                justify-center
                rounded-[40px]
                bg-[linear-gradient(93.11deg,rgba(210,138,76,0.54)_-0.94%,#D28A4C_105.02%)]
                text-[14px]
                font-bold
                leading-[16px]
                text-[var(--color-foreground-kurio)]
                transition-opacity
                active:opacity-80
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
                mt-[6px]
                px-[16px]
                text-[11px]
                leading-[16px]
                text-destructive
              "
            >
              {couponError}
            </p>
          )}

          {appliedCoupon &&
            !couponError && (
              <div
                className="
                  mt-[8px]
                  flex
                  items-center
                  justify-between
                  px-[4px]
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-[7px]
                  "
                >
                  <BadgeCheck
                    size={14}
                    strokeWidth={2}
                    className="
                      text-[var(--color-text-accent)]
                    "
                  />

                  <p
                    className="
                      text-[11px]
                      font-medium
                      leading-[16px]
                      text-[var(--color-text-accent)]
                    "
                  >
                    {appliedCoupon}{' '}
                    aplicado — 10% OFF
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleRemoveCoupon
                  }
                  className="
                    flex
                    h-[24px]
                    w-[24px]
                    items-center
                    justify-center
                    rounded-full
                    text-[var(--color-text-secondary)]
                    transition-colors
                    active:bg-[var(--color-border-kurio)]
                  "
                  aria-label={`Remover cupom ${appliedCoupon}`}
                >
                  <X
                    size={13}
                    strokeWidth={2}
                  />
                </button>
              </div>
            )}
        </div>

        {/* Valores */}
        <div
          className="
            mt-[14px]
            flex
            w-full
            flex-col
            gap-[12px]
          "
        >
          {/* Subtotal */}
          <div
            className="
              flex
              h-[20px]
              w-full
              items-center
              justify-between
            "
          >
            <span
              className="
                text-[15px]
                font-normal
                leading-[100%]
                text-[var(--color-foreground-kurio)]
              "
            >
              Subtotal
            </span>

            <span
              className="
                text-right
                text-[16px]
                font-normal
                leading-[16px]
                text-[var(--color-foreground-kurio)]
              "
            >
              {subtotal.toFixed(
                2,
              )}{' '}
              ETH
            </span>
          </div>

          {/* Desconto */}
          <div
            className="
              flex
              h-[20px]
              w-full
              items-center
              justify-between
            "
          >
            <span
              className="
                text-[15px]
                font-normal
                leading-[100%]
                text-[var(--color-foreground-kurio)]
              "
            >
              Desconto do lançamento
            </span>

            <span
              className={`
                text-right
                text-[16px]
                font-normal
                leading-[16px]

                ${
                  appliedCoupon
                    ? `
                      text-[var(--color-text-accent)]
                    `
                    : `
                      text-[var(--color-foreground-kurio)]
                    `
                }
              `}
            >
              (-){' '}
              {discount.toFixed(
                2,
              )}
            </span>
          </div>

          {/* Taxa */}
          <div
            className="
              flex
              min-h-[32px]
              w-full
              items-start
              justify-between
            "
          >
            <span
              className="
                pt-[2px]
                text-[15px]
                font-normal
                leading-[100%]
                text-[var(--color-foreground-kurio)]
              "
            >
              Taxa de rede
            </span>

            <div
              className="
                text-right
              "
            >
              <p
                className="
                  text-[16px]
                  font-normal
                  leading-[16px]
                  text-[var(--color-foreground-kurio)]
                "
              >
                {networkFee.toFixed(
                  3,
                )}{' '}
                ETH
              </p>

              <p
                className="
                  mt-[5px]
                  text-[10px]
                  font-normal
                  leading-[12px]
                  text-[var(--color-text-accent)]
                "
              >
                Taxa estimada
              </p>
            </div>
          </div>

          {/* Total */}
          <div
            className="
              flex
              h-[20px]
              w-full
              items-center
              justify-between
            "
          >
            <span
              className="
                text-[15px]
                font-bold
                leading-[16px]
                text-[var(--color-foreground-kurio)]
              "
            >
              Total
            </span>

            <span
              className="
                text-right
                text-[18px]
                font-bold
                leading-[16px]
                text-[var(--color-text-accent)]
              "
            >
              {total.toFixed(
                3,
              )}{' '}
              ETH
            </span>
          </div>
        </div>

        {/* Finalizar */}
        {isEmpty ? (
          <button
            type="button"
            disabled
            className="
              mt-[24px]
              h-[52px]
              w-full
              rounded-[40px]
              bg-[linear-gradient(93.21deg,#D28A4C_-3.96%,rgba(210,138,76,0.8)_121.97%)]
              text-center
              text-[15px]
              font-bold
              leading-[16px]
              text-[var(--color-ink)]
              opacity-40
              disabled:cursor-not-allowed
            "
          >
            Conectar e finalizar
          </button>
        ) : (
          <Link
            to="/checkout"
            className="
              mt-[24px]
              flex
              h-[52px]
              w-full
              items-center
              justify-center
              rounded-[40px]
              bg-[linear-gradient(93.21deg,#D28A4C_-3.96%,rgba(210,138,76,0.8)_121.97%)]
              text-center
              text-[15px]
              font-bold
              leading-[16px]
              text-[var(--color-ink)]
              transition-opacity
              active:opacity-80
            "
          >
            Conectar e finalizar
          </Link>
        )}
      </div>

      {/* DESKTOP */}
      <div
        className="
          max-md:hidden
        "
      >
        <h2
          className="
            border-b
            border-[var(--color-border-kurio)]
            pb-[10px]
            text-[14px]
            font-bold
            leading-[18px]
            text-[var(--color-foreground-kurio)]
          "
        >
          Resumo da carteira
        </h2>

        <div
          className="
            mt-[16px]
          "
        >
          {!appliedCoupon && (
            <div
              className="
                flex
                items-start
                gap-[10px]
                rounded-[6px]
                border
                border-[var(--color-primary-kurio)]/40
                bg-[var(--color-primary-kurio)]/8
                px-[12px]
                py-[10px]
              "
            >
              <div
                className="
                  mt-[1px]
                  flex
                  h-[28px]
                  w-[28px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--color-primary-kurio)]/15
                  text-[var(--color-text-accent)]
                "
              >
                <BadgePercent
                  size={15}
                  strokeWidth={2}
                />
              </div>

              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    text-[12px]
                    font-bold
                    leading-[17px]
                    text-[var(--color-foreground-kurio)]
                  "
                >
                  Cupom disponível
                </p>

                <p
                  className="
                    mt-[2px]
                    text-[11px]
                    leading-[17px]
                    text-[var(--color-text-secondary)]
                  "
                >
                  Use{' '}
                  <button
                    type="button"
                    onClick={
                      handleUseAvailableCoupon
                    }
                    disabled={
                      isEmpty
                    }
                    className="
                      font-bold
                      text-[var(--color-text-accent)]
                      underline
                      underline-offset-2
                      transition-opacity
                      hover:opacity-80
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    KURIO10
                  </button>{' '}
                  e receba 10% de
                  desconto.
                </p>
              </div>
            </div>
          )}

          {!appliedCoupon ? (
            <>
              <label
                htmlFor="coupon-code"
                className="
                  mt-[14px]
                  block
                  text-[12px]
                  font-medium
                  leading-[16px]
                  text-[var(--color-foreground-kurio)]
                "
              >
                Código promocional
              </label>

              <div
                className="
                  mt-[7px]
                  flex
                "
              >
                <Input
                  id="coupon-code"
                  type="text"
                  value={
                    couponInput
                  }
                  onChange={(
                    event,
                  ) => {
                    setCouponInput(
                      event.target
                        .value,
                    )

                    if (
                      couponError
                    ) {
                      setCouponError(
                        null,
                      )
                    }
                  }}
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                      'Enter'
                    ) {
                      handleApplyCoupon()
                    }
                  }}
                  disabled={
                    isEmpty
                  }
                  placeholder="Digite o código..."
                  autoComplete="off"
                  className="
                    h-[38px]
                    rounded-r-none
                    border-[var(--color-border-kurio)]
                    bg-transparent
                    px-[11px]
                    text-[12px]
                    text-[var(--color-foreground-kurio)]
                    shadow-none
                    placeholder:text-[var(--color-text-secondary)]
                    focus-visible:border-[var(--color-primary-kurio)]
                    focus-visible:ring-[var(--color-primary-kurio)]/15
                  "
                />

                <button
                  type="button"
                  onClick={
                    handleApplyCoupon
                  }
                  disabled={
                    isEmpty
                  }
                  className="
                    h-[38px]
                    shrink-0
                    rounded-r-[6px]
                    bg-[var(--color-primary-kurio)]
                    px-[16px]
                    text-[12px]
                    font-bold
                    text-[var(--color-ink)]
                    transition-opacity
                    hover:opacity-90
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
                    mt-[6px]
                    text-[11px]
                    leading-[16px]
                    text-destructive
                  "
                >
                  {couponError}
                </p>
              )}
            </>
          ) : (
            <div
              role="status"
              className="
                flex
                items-center
                justify-between
                gap-[12px]
                rounded-[6px]
                border
                border-[var(--color-primary-kurio)]/50
                bg-[var(--color-primary-kurio)]/10
                px-[12px]
                py-[11px]
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-[10px]
                "
              >
                <div
                  className="
                    flex
                    h-[30px]
                    w-[30px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--color-primary-kurio)]/18
                    text-[var(--color-text-accent)]
                  "
                >
                  <BadgeCheck
                    size={17}
                    strokeWidth={2}
                  />
                </div>

                <div
                  className="
                    min-w-0
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-[7px]
                    "
                  >
                    <span
                      className="
                        text-[12px]
                        font-bold
                        leading-[17px]
                        text-[var(--color-foreground-kurio)]
                      "
                    >
                      {
                        appliedCoupon
                      }
                    </span>

                    <span
                      className="
                        rounded-[4px]
                        bg-[var(--color-primary-kurio)]
                        px-[6px]
                        py-[2px]
                        text-[9px]
                        font-bold
                        leading-[12px]
                        text-[var(--color-ink)]
                      "
                    >
                      10% OFF
                    </span>
                  </div>

                  <p
                    className="
                      mt-[2px]
                      text-[11px]
                      leading-[16px]
                      text-[var(--color-text-secondary)]
                    "
                  >
                    Desconto aplicado
                    ao pedido.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  handleRemoveCoupon
                }
                aria-label={`Remover cupom ${appliedCoupon}`}
                className="
                  flex
                  h-[30px]
                  w-[30px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[5px]
                  text-[var(--color-text-secondary)]
                  transition-colors
                  hover:bg-[var(--color-primary-kurio)]/10
                  hover:text-[var(--color-text-accent)]
                "
              >
                <X
                  size={16}
                  strokeWidth={2}
                />
              </button>
            </div>
          )}
        </div>

        <div
          className="
            mt-[20px]
            space-y-[12px]
            text-[12px]
            leading-[18px]
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-[20px]
            "
          >
            <span
              className="
                text-[var(--color-text-secondary)]
              "
            >
              Subtotal
            </span>

            <span
              className="
                font-medium
                text-[var(--color-foreground-kurio)]
              "
            >
              {subtotal.toFixed(
                2,
              )}{' '}
              ETH
            </span>
          </div>

          <div
            className="
              flex
              items-center
              justify-between
              gap-[20px]
            "
          >
            <span
              className="
                text-[var(--color-text-secondary)]
              "
            >
              Desconto
            </span>

            <span
              className={
                appliedCoupon
                  ? `
                    font-medium
                    text-[var(--color-text-accent)]
                  `
                  : `
                    font-medium
                    text-[var(--color-foreground-kurio)]
                  `
              }
            >
              (-){' '}
              {discount.toFixed(
                2,
              )}{' '}
              ETH
            </span>
          </div>

          <div
            className="
              flex
              items-center
              justify-between
              gap-[20px]
            "
          >
            <span
              className="
                text-[var(--color-text-secondary)]
              "
            >
              Taxa de rede
            </span>

            <span
              className="
                font-medium
                text-[var(--color-foreground-kurio)]
              "
            >
              {networkFee.toFixed(
                3,
              )}{' '}
              ETH
            </span>
          </div>

          <p
            className="
              text-right
              text-[10px]
              leading-[14px]
              text-[var(--color-text-accent)]
            "
          >
            Taxa estimada
          </p>
        </div>

        <div
          className="
            mt-[18px]
            flex
            items-center
            justify-between
            border-t
            border-[var(--color-border-kurio)]
            pt-[14px]
          "
        >
          <span
            className="
              text-[14px]
              font-bold
              text-[var(--color-foreground-kurio)]
            "
          >
            Total
          </span>

          <span
            className="
              text-[16px]
              font-bold
              text-[var(--color-text-accent)]
            "
          >
            {total.toFixed(
              3,
            )}{' '}
            ETH
          </span>
        </div>

        {isEmpty ? (
          <button
            type="button"
            disabled
            className="
              mt-[18px]
              h-[40px]
              w-full
              rounded-[6px]
              bg-[var(--color-primary-kurio)]
              text-[13px]
              font-bold
              text-[var(--color-ink)]
              opacity-40
              disabled:cursor-not-allowed
            "
          >
            Conectar e finalizar
          </button>
        ) : (
          <Link
            to="/checkout"
            className="
              mt-[18px]
              flex
              h-[40px]
              w-full
              items-center
              justify-center
              rounded-[6px]
              bg-[var(--color-primary-kurio)]
              text-[13px]
              font-bold
              text-[var(--color-ink)]
              transition-opacity
              hover:opacity-90
            "
          >
            Conectar e finalizar
          </Link>
        )}

        <Link
          to="/"
          hash="catalog"
          className="
            mt-[12px]
            block
            w-full
            text-center
            text-[12px]
            font-medium
            text-[var(--color-text-accent)]
            transition-opacity
            hover:opacity-70
          "
        >
          Continuar explorando
        </Link>
      </div>
    </aside>
  )
}