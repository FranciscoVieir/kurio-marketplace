import {
  Link,
} from '@tanstack/react-router'

import {
  Clock3,
  ExternalLink,
  ShoppingBag,
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

export function ProfileActivityPage() {
  const {
    data: orders = [],
    isLoading,
    isError,
  } = useMyOrders()

  if (isLoading) {
    return (
      <p className="text-xs text-[var(--color-text-secondary)]">
        Carregando atividade...
      </p>
    )
  }

  if (isError) {
    return (
      <p className="text-xs text-red-400">
        Não foi possível carregar sua atividade.
      </p>
    )
  }

  return (
    <section>
      <div>
        <h1 className="text-sm font-semibold text-[var(--color-foreground-kurio)]">
          Atividade
        </h1>

        <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
          Acompanhe suas compras e transações recentes.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 border border-[var(--color-border-kurio)] p-8 text-center">
          <ShoppingBag
            size={28}
            className="mx-auto text-[var(--color-text-accent)]"
          />

          <p className="mt-4 text-sm text-[var(--color-foreground-kurio)]">
            Nenhuma atividade ainda
          </p>

          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
            Suas compras aparecerão aqui.
          </p>

          <Link
            to="/"
            className="mt-5 inline-block text-xs text-[var(--color-text-accent)]"
          >
            Explorar NFTs
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map(
            (order) => (
              <article
                key={
                  order.id
                }
                className="
                  border
                  border-[var(--color-border-kurio)]
                  p-5
                "
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock3
                        size={13}
                        className="text-[var(--color-text-accent)]"
                      />

                      <span className="text-[10px] text-[var(--color-text-secondary)]">
                        {formatDate(
                          order.createdAt,
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-[var(--color-foreground-kurio)]">
                      Pedido{' '}
                      {order.id.slice(
                        0,
                        18,
                      )}
                      ...
                    </p>
                  </div>

                  <span
                    className="
                      border
                      border-[var(--color-border-kurio)]
                      px-3
                      py-1
                      text-[10px]
                      text-[var(--color-text-accent)]
                    "
                  >
                    {getStatusLabel(
                      order.status,
                    )}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {order.items.map(
                    (item) => (
                      <div
                        key={
                          item.nftId
                        }
                        className="flex items-center gap-3"
                      >
                        <img
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.name
                          }
                          className="h-12 w-12 rounded-[var(--radius-nft)] object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-[var(--color-foreground-kurio)]">
                            {
                              item.name
                            }
                          </p>

                          <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
                            Token #
                            {
                              item.tokenId
                            }{' '}
                            · x
                            {
                              item.quantity
                            }
                          </p>
                        </div>

                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {
                            item.subtotalEth
                          }{' '}
                          ETH
                        </p>
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border-kurio)] pt-4">
                  <div>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">
                      Total
                    </p>

                    <p className="mt-1 text-sm text-[var(--color-foreground-kurio)]">
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
                      flex
                      items-center
                      gap-2
                      text-xs
                      text-[var(--color-text-accent)]
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