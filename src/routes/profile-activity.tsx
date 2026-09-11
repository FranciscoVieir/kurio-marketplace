import {
  Link,
} from '@tanstack/react-router'

import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  ShoppingBag,
  TriangleAlert,
} from 'lucide-react'

import {
  useMyOrders,
} from '@/features/orders/hooks/use-my-orders'

function formatDate(
  value: string,
) {
  const date =
    new Date(value)

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(date)
}

function getStatusLabel(
  status:
    | 'pending'
    | 'confirmed'
    | 'failed',
) {
  switch (status) {
    case 'pending':
      return 'Pendente'

    case 'confirmed':
      return 'Confirmado'

    case 'failed':
      return 'Falhou'
  }
}

function getStatusClassName(
  status:
    | 'pending'
    | 'confirmed'
    | 'failed',
) {
  switch (status) {
    case 'confirmed':
      return `
        border-[rgba(110,196,145,0.28)]
        bg-[rgba(110,196,145,0.08)]
        text-emerald-300
      `

    case 'failed':
      return `
        border-red-400/25
        bg-red-400/5
        text-red-400
      `

    case 'pending':
    default:
      return `
        border-[rgba(210,138,76,0.28)]
        bg-[rgba(210,138,76,0.08)]
        text-[var(--color-text-accent)]
      `
  }
}

function getStatusIcon(
  status:
    | 'pending'
    | 'confirmed'
    | 'failed',
) {
  if (status === 'confirmed') {
    return (
      <CheckCircle2
        size={13}
        aria-hidden="true"
      />
    )
  }

  if (status === 'failed') {
    return (
      <TriangleAlert
        size={13}
        aria-hidden="true"
      />
    )
  }

  return (
    <Clock3
      size={13}
      aria-hidden="true"
    />
  )
}

export function ProfileActivityPage() {
  const {
    data: orders = [],
    isLoading,
    isError,
  } = useMyOrders()

  if (isLoading) {
    return (
      <section
        aria-label="Carregando atividade"
        className="
          w-full
          max-w-225

          max-md:mx-auto
          max-md:max-w-[366px]
        "
      >
        <div
          className="
            h-7
            w-32
            animate-pulse
            rounded-md
            bg-[var(--color-surface-card)]

            max-md:h-[24px]
            max-md:w-[140px]
            max-md:rounded-[8px]
          "
        />

        <div
          className="
            mt-2
            h-4
            w-72
            animate-pulse
            rounded-sm
            bg-[var(--color-surface-card)]

            max-md:mt-[8px]
            max-md:w-[250px]
            max-md:max-w-full
          "
        />

        <div
          className="
            mt-7
            space-y-4

            max-md:mt-[24px]
            max-md:space-y-[12px]
          "
        >
          {Array.from({
            length: 3,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="
                  rounded-lg
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]
                  p-5

                  max-md:rounded-[14px]
                  max-md:p-[16px]
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4

                    max-md:gap-[12px]
                  "
                >
                  <div className="space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded-sm bg-[var(--color-border-kurio)]" />
                    <div className="h-4 w-44 animate-pulse rounded-sm bg-[var(--color-border-kurio)]" />
                  </div>

                  <div className="h-7 w-24 animate-pulse rounded-md bg-[var(--color-border-kurio)]" />
                </div>

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    gap-3

                    max-md:mt-[16px]
                    max-md:gap-[12px]
                  "
                >
                  <div className="size-12 animate-pulse rounded-md bg-[var(--color-border-kurio)]" />

                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 animate-pulse rounded-sm bg-[var(--color-border-kurio)]" />
                    <div className="h-3 w-28 animate-pulse rounded-sm bg-[var(--color-border-kurio)]" />
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section
        className="
          w-full
          max-w-225

          max-md:mx-auto
          max-md:max-w-[366px]
        "
      >
        <div
          role="alert"
          className="
            rounded-lg
            border
            border-red-400/20
            bg-red-400/5
            px-5
            py-4

            max-md:rounded-[14px]
            max-md:px-[16px]
            max-md:py-[14px]
          "
        >
          <div className="flex items-start gap-3">
            <TriangleAlert
              size={17}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div className="min-w-0">
              <p
                className="
                  text-sm
                  font-semibold
                  text-[var(--color-foreground-kurio)]

                  max-md:text-[14px]
                  max-md:leading-[20px]
                "
              >
                Não foi possível carregar sua atividade
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-[var(--color-text-secondary)]

                  max-md:text-[13px]
                  max-md:leading-[20px]
                "
              >
                Tente novamente em alguns instantes.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="
        w-full
        max-w-225

        max-md:mx-auto
        max-md:max-w-[366px]
      "
    >
      <div>
        <h1
          className="
            text-xl
            font-semibold
            leading-7
            text-[var(--color-foreground-kurio)]

            max-md:text-[20px]
            max-md:font-bold
            max-md:leading-[24px]
          "
        >
          Atividade
        </h1>

        <p
          className="
            mt-1.5
            text-xs
            leading-5
            text-[var(--color-text-secondary)]

            max-md:mt-[6px]
            max-md:text-[13px]
            max-md:leading-[20px]
          "
        >
          Acompanhe suas compras e transações recentes.
        </p>
      </div>

      {orders.length === 0 ? (
        <div
          className="
            mt-7
            flex
            min-h-80
            flex-col
            items-center
            justify-center
            rounded-lg
            border
            border-[var(--color-border-kurio)]
            bg-[var(--color-surface-card)]
            px-6
            py-10
            text-center

            max-md:mt-[24px]
            max-md:min-h-[280px]
            max-md:rounded-[14px]
            max-md:px-[20px]
            max-md:py-[32px]
          "
        >
          <div
            className="
              flex
              size-14
              items-center
              justify-center
              rounded-full
              border
              border-[rgba(210,138,76,0.24)]
              bg-[rgba(210,138,76,0.08)]

              max-md:size-[52px]
            "
          >
            <ShoppingBag
              size={24}
              className="text-[var(--color-text-accent)]"
            />
          </div>

          <p
            className="
              mt-5
              text-base
              font-semibold
              text-[var(--color-foreground-kurio)]

              max-md:mt-[18px]
              max-md:text-[16px]
              max-md:font-bold
              max-md:leading-[22px]
            "
          >
            Nenhuma atividade ainda
          </p>

          <p
            className="
              mt-2
              max-w-80
              text-xs
              leading-5
              text-[var(--color-text-secondary)]

              max-md:max-w-[280px]
              max-md:text-[13px]
              max-md:leading-[20px]
            "
          >
            Suas compras e atualizações de pedidos aparecerão aqui.
          </p>

          <Link
            to="/"
            hash="catalog"
            className="
              mt-6
              inline-flex
              h-10
              items-center
              justify-center
              rounded-md
              bg-[var(--color-primary-kurio)]
              px-5
              text-xs
              font-semibold
              text-[var(--color-ink)]
              transition
              hover:opacity-90
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--color-primary-kurio)]/30

              max-md:mt-[22px]
              max-md:h-[48px]
              max-md:w-full
              max-md:max-w-[260px]
              max-md:rounded-[24px]
              max-md:text-[14px]
              max-md:font-bold
            "
          >
            Explorar NFTs
          </Link>
        </div>
      ) : (
        <div
          className="
            mt-7
            space-y-4

            max-md:mt-[24px]
            max-md:space-y-[12px]
          "
        >
          {orders.map(
            (order) => (
              <article
                key={
                  order.id
                }
                className="
                  rounded-lg
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]
                  p-5
                  transition
                  hover:border-[rgba(210,138,76,0.28)]

                  max-md:rounded-[14px]
                  max-md:p-[16px]
                "
              >
                <div
                  className="
                    flex
                    flex-wrap
                    items-start
                    justify-between
                    gap-4

                    max-md:flex-nowrap
                    max-md:gap-[12px]
                  "
                >
                  <div className="min-w-0">
                    <div
                      className="
                        flex
                        items-center
                        gap-2

                        max-md:gap-[6px]
                      "
                    >
                      <Clock3
                        size={13}
                        className="text-[var(--color-text-accent)]"
                      />

                      <span
                        className="
                          text-[11px]
                          leading-4
                          text-[var(--color-text-secondary)]

                          max-md:text-[11px]
                          max-md:leading-[16px]
                        "
                      >
                        {formatDate(
                          order.createdAt,
                        )}
                      </span>
                    </div>

                    <p
                      className="
                        mt-2
                        text-sm
                        font-medium
                        leading-5
                        text-[var(--color-foreground-kurio)]

                        max-md:mt-[6px]
                        max-md:text-[14px]
                        max-md:font-semibold
                        max-md:leading-[20px]
                      "
                    >
                      Pedido{' '}
                      <span
                        className="
                          font-mono
                          text-xs
                          text-[var(--color-text-secondary)]

                          max-md:text-[11px]
                        "
                      >
                        {order.id.slice(
                          0,
                          18,
                        )}
                        ...
                      </span>
                    </p>
                  </div>

                  <span
                    className={`
                      inline-flex
                      h-7
                      items-center
                      gap-1.5
                      rounded-md
                      border
                      px-2.5
                      text-[10px]
                      font-semibold

                      max-md:h-[28px]
                      max-md:shrink-0
                      max-md:rounded-[14px]
                      max-md:px-[10px]
                      max-md:text-[10px]

                      ${getStatusClassName(
                        order.status,
                      )}
                    `}
                  >
                    {getStatusIcon(
                      order.status,
                    )}

                    {getStatusLabel(
                      order.status,
                    )}
                  </span>
                </div>

                <div
                  className="
                    mt-5
                    space-y-3

                    max-md:mt-[16px]
                    max-md:space-y-[10px]
                  "
                >
                  {order.items.map(
                    (item) => (
                      <div
                        key={
                          item.nftId
                        }
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-md
                          border
                          border-[var(--color-border-kurio)]
                          bg-[rgba(20,13,10,0.32)]
                          p-3

                          max-md:gap-[10px]
                          max-md:rounded-[12px]
                          max-md:p-[10px]
                        "
                      >
                        <img
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.name
                          }
                          className="
                            size-12
                            shrink-0
                            rounded-md
                            object-cover

                            max-md:size-[52px]
                            max-md:rounded-[10px]
                          "
                        />

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <p
                            className="
                              truncate
                              text-xs
                              font-semibold
                              leading-4
                              text-[var(--color-foreground-kurio)]

                              max-md:text-[13px]
                              max-md:leading-[18px]
                            "
                          >
                            {
                              item.name
                            }
                          </p>

                          <p
                            className="
                              mt-1
                              text-[10px]
                              leading-4
                              text-[var(--color-text-secondary)]

                              max-md:text-[11px]
                              max-md:leading-[16px]
                            "
                          >
                            Token #
                            {
                              item.tokenId
                            }{' '}
                            · Quantidade:{' '}
                            {
                              item.quantity
                            }
                          </p>
                        </div>

                        <p
                          className="
                            shrink-0
                            text-xs
                            font-semibold
                            text-[var(--color-text-accent)]

                            max-md:text-[13px]
                            max-md:leading-[18px]
                          "
                        >
                          {
                            item.subtotalEth
                          }{' '}
                          ETH
                        </p>
                      </div>
                    ),
                  )}
                </div>

                <div
                  className="
                    mt-5
                    flex
                    flex-wrap
                    items-end
                    justify-between
                    gap-4
                    border-t
                    border-[var(--color-border-kurio)]
                    pt-4

                    max-md:mt-[16px]
                    max-md:items-center
                    max-md:gap-[12px]
                    max-md:pt-[14px]
                  "
                >
                  <div className="min-w-0">
                    <p
                      className="
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-[0.08em]
                        text-[var(--color-text-secondary)]

                        max-md:text-[10px]
                        max-md:leading-[14px]
                      "
                    >
                      Total do pedido
                    </p>

                    <p
                      className="
                        mt-1
                        text-base
                        font-semibold
                        leading-6
                        text-[var(--color-text-accent)]

                        max-md:text-[16px]
                        max-md:font-bold
                        max-md:leading-[20px]
                      "
                    >
                      {
                        order.totalEth
                      }{' '}
                      ETH
                    </p>
                  </div>

                  <Link
                    to="/orders/$orderId"
                    params={{
                      orderId:
                        order.id,
                    }}
                    className="
                      inline-flex
                      h-9
                      items-center
                      gap-2
                      rounded-md
                      border
                      border-[var(--color-border-kurio)]
                      px-3
                      text-xs
                      font-medium
                      text-[var(--color-text-accent)]
                      transition
                      hover:border-[rgba(210,138,76,0.35)]
                      hover:bg-[rgba(210,138,76,0.06)]
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[var(--color-primary-kurio)]/25

                      max-md:h-[40px]
                      max-md:rounded-[20px]
                      max-md:px-[14px]
                      max-md:text-[12px]
                    "
                  >
                    Ver detalhes

                    <ExternalLink
                      size={13}
                    />
                  </Link>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  )
}
