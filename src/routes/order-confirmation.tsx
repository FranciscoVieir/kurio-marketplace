import {
  Link,
  useParams,
} from '@tanstack/react-router'

import { OrderConfirmationCard } from '@/features/orders/components/order-confirmation-card'
import { useOrder } from '@/features/orders/hooks/use-order'

export function OrderConfirmationPage() {
  const params = useParams({
    strict: false,
  })

  const orderId =
    'orderId' in params
      ? String(params.orderId)
      : ''

  const {
    data: order,
    isPending,
    isError,
  } = useOrder(orderId)

  return (
    <main
      className="
        flex min-h-screen
        items-start justify-center
        bg-background
        px-5
        pb-16 pt-[12vh]
      "
    >
      {isPending && (
        <div className="py-20 text-center">
          <p className="text-sm font-bold text-foreground">
            Carregando transação...
          </p>

          <p className="mt-2 text-[10px] text-[var(--color-text-secondary)]">
            Estamos recuperando os dados do seu pedido.
          </p>
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="
            w-full
            max-w-[470px]
            border
            border-destructive
            bg-[var(--color-surface-card)]
            p-6
          "
        >
          <h1 className="text-sm font-bold text-foreground">
            Não foi possível encontrar essa transação
          </h1>

          <p className="mt-2 text-[10px] leading-relaxed text-[var(--color-text-secondary)]">
            O pedido pode não existir ou os dados do ambiente de testes podem ter sido reiniciados.
          </p>

          <Link
            to="/"
            className="
              mt-5
              inline-flex h-9
              items-center justify-center
              bg-[var(--color-primary-kurio)]
              px-5
              text-[10px] font-bold
              text-[var(--color-ink)]
            "
          >
            Voltar ao mercado
          </Link>
        </div>
      )}

      {order && (
        <OrderConfirmationCard
          order={order}
        />
      )}
    </main>
  )
}