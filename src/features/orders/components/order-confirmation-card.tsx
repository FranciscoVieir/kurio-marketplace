import {
  useEffect,
} from 'react'
import {
  useNavigate,
} from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

import { useCart } from '@/features/cart/hooks/use-cart'

import type {
  CheckoutWalletProvider,
  Order,
} from '@/features/checkout/types/checkout'

type OrderConfirmationCardProps = {
  order: Order
}

function formatTransactionHash(
  transactionHash: string,
) {
  if (transactionHash.length <= 16) {
    return transactionHash
  }

  return `${transactionHash.slice(0, 8)}...${transactionHash.slice(-4)}`
}

function formatOrderDate(
  createdAt: string,
) {
  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  ).format(
    new Date(createdAt),
  )
}

function getWalletProviderLabel(
  walletProvider: CheckoutWalletProvider,
) {
  if (walletProvider === 'metamask') {
    return 'MetaMask'
  }

  return 'Coinbase'
}

function getNetworkLabel(
  network: Order['network'],
) {
  if (network === 'ethereum') {
    return 'Ethereum'
  }

  if (network === 'polygon') {
    return 'Polygon'
  }

  return 'Solana'
}

function getExplorerLabel(
  network: Order['network'],
) {
  if (network === 'ethereum') {
    return 'Ver no Etherscan'
  }

  if (network === 'polygon') {
    return 'Ver no Polygonscan'
  }

  return 'Ver no Solscan'
}

export function OrderConfirmationCard({
  order,
}: OrderConfirmationCardProps) {
  const navigate =
    useNavigate()

  const {
    consumeConfirmedOrder,
    isHydrating:
      isCartHydrating,
  } = useCart()

  const networkLabel =
    getNetworkLabel(order.network)

  const isConfirmed =
    order.status === 'confirmed'

  const isFailed =
    order.status === 'failed'

  useEffect(() => {
    if (
      !isConfirmed ||
      isCartHydrating
    ) {
      return
    }

    consumeConfirmedOrder(
      order.id,
      order.items.map(
        (item) => ({
          nftId:
            item.nftId,

          quantity:
            item.quantity,
        }),
      ),
    )
  }, [
    consumeConfirmedOrder,
    isCartHydrating,
    isConfirmed,
    order.id,
    order.items,
  ])

  function handleClose() {
    void navigate({
      to: '/',
    })
  }

  return (
    <article
      className="
        relative
        w-full
        max-w-130
        overflow-hidden
        border
        border-[var(--color-border-kurio)]
        bg-[var(--color-surface-card)]
        text-foreground
        shadow-2xl

        max-md:max-w-[366px]
        max-md:rounded-[24px]
        max-md:shadow-none
      "
    >
      {/* MOBILE: navegação */}
      <div
        className="
          hidden

          max-md:grid
          max-md:h-[44px]
          max-md:w-full
          max-md:grid-cols-[35px_minmax(0,1fr)_35px]
          max-md:items-center
          max-md:px-[16px]
          max-md:pt-[16px]
        "
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Voltar ao mercado"
          className="
            flex
            h-[35px]
            w-[35px]
            items-center
            justify-center
            rounded-full
            border
            border-[var(--color-border-kurio)]
            bg-[var(--color-surface-raised)]
            text-[var(--color-primary-kurio)]
            transition-opacity
            active:opacity-70
          "
        >
          <ChevronLeft
            size={16}
            strokeWidth={1.5}
          />
        </button>

        <h1
          className="
            truncate
            px-[10px]
            text-center
            text-[20px]
            font-bold
            leading-[16px]
            text-[var(--color-foreground-kurio)]
          "
        >
          Comprovante
        </h1>

        <span aria-hidden="true" />
      </div>

      <button
        type="button"
        onClick={handleClose}
        aria-label="Fechar comprovante e voltar ao mercado"
        title="Voltar ao mercado"
        className="
          absolute
          right-5
          top-4
          z-10
          flex
          size-8
          items-center
          justify-center
          rounded-full
          text-[18px]
          leading-none
          text-[var(--color-text-accent)]
          transition
          hover:bg-[rgba(210,138,76,0.12)]
          hover:text-foreground
          focus-visible:outline-none
          focus-visible:ring-1
          focus-visible:ring-[var(--color-primary-kurio)]

          max-md:hidden
        "
      >
        ×
      </button>

      <header
        className="
          px-7
          pb-1
          pt-7

          max-md:px-[18px]
          max-md:pb-0
          max-md:pt-[28px]
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
          "
        >
          <p
            className="
              mt-4
              text-center
              text-[12px]
              font-bold
              leading-5

              max-md:mt-[16px]
              max-md:text-[18px]
              max-md:leading-[24px]
            "
          >
            {isConfirmed
              ? 'Pedido realizado com sucesso'
              : isFailed
                ? 'Pagamento recusado'
                : 'Pedido recebido'}
          </p>

          <p
            className="
              mt-1
              max-w-85
              text-center
              text-[10px]
              leading-4
              text-[var(--color-text-secondary)]

              max-md:mt-[6px]
              max-md:max-w-[300px]
              max-md:text-[13px]
              max-md:leading-[20px]
            "
          >
            {isConfirmed
              ? 'Sua transação foi confirmada.'
              : isFailed
                ? 'A transação não foi concluída. Os itens permanecem no carrinho.'
                : 'Acompanhe abaixo o processamento da sua transação.'}
          </p>
        </div>
      </header>

      <div
        role="status"
        aria-live="polite"
        className="
          mx-7
          mt-5
          border
          border-[var(--color-border-kurio)]
          bg-[rgba(210,138,76,0.06)]
          px-5
          py-4

          max-md:mx-[16px]
          max-md:mt-[20px]
          max-md:rounded-[14px]
          max-md:px-[16px]
          max-md:py-[16px]
        "
      >
        <p
          className="
            text-[9px]
            font-bold
            uppercase
            tracking-[0.12em]
            text-[var(--color-text-secondary)]

            max-md:text-[11px]
            max-md:leading-[16px]
          "
        >
          Status do pedido
        </p>

        <div className="mt-4 space-y-3 max-md:mt-[16px] max-md:space-y-[14px]">
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <span
              className="
                flex
                size-5
                items-center

                max-md:size-[22px]
                justify-center
                rounded-full
                bg-[var(--color-primary-kurio)]
                text-[9px]
                font-bold
                text-[var(--color-ink)]
              "
            >
              ✓
            </span>

            <div>
              <p
                className="
                  text-[10px]
                  font-bold

                  max-md:text-[13px]
                  max-md:leading-[18px]
                "
              >
                Pedido recebido
              </p>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  text-[var(--color-text-secondary)]

                  max-md:mt-[2px]
                  max-md:text-[11px]
                  max-md:leading-[16px]
                "
              >
                Sua compra foi registrada.
              </p>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <span
              className={`
                flex
                size-5
                items-center

                max-md:size-[22px]
                justify-center
                rounded-full
                border
                text-[9px]
                font-bold
                ${
                  isConfirmed
                    ? `
                      border-[var(--color-primary-kurio)]
                      bg-[var(--color-primary-kurio)]
                      text-[var(--color-ink)]
                    `
                    : `
                      animate-pulse
                      border-[var(--color-primary-kurio)]
                      text-[var(--color-text-accent)]
                    `
                }
              `}
            >
              {isConfirmed
                ? '✓'
                : isFailed
                  ? '!'
                  : '•'}
            </span>

            <div>
              <p
                className="
                  text-[10px]
                  font-bold

                  max-md:text-[13px]
                  max-md:leading-[18px]
                "
              >
                {isFailed
                  ? 'Transação recusada'
                  : 'Processando transação'}
              </p>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  text-[var(--color-text-secondary)]

                  max-md:mt-[2px]
                  max-md:text-[11px]
                  max-md:leading-[16px]
                "
              >
                {isConfirmed
                  ? 'Processamento concluído.'
                  : isFailed
                    ? 'O pagamento não foi confirmado.'
                    : `Aguardando confirmação na ${networkLabel}.`}
              </p>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <span
              className={`
                flex
                size-5
                items-center

                max-md:size-[22px]
                justify-center
                rounded-full
                border
                text-[9px]
                font-bold
                ${
                  isConfirmed
                    ? `
                      border-[var(--color-primary-kurio)]
                      bg-[var(--color-primary-kurio)]
                      text-[var(--color-ink)]
                    `
                    : `
                      border-[var(--color-border-kurio)]
                      text-[var(--color-text-secondary)]
                    `
                }
              `}
            >
              {isConfirmed
                ? '✓'
                : isFailed
                  ? '!'
                  : '3'}
            </span>

            <div>
              <p
                className="
                  text-[10px]
                  font-bold

                  max-md:text-[13px]
                  max-md:leading-[18px]
                "
              >
                {isFailed
                  ? 'Não confirmado'
                  : 'Confirmado'}
              </p>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  text-[var(--color-text-secondary)]

                  max-md:mt-[2px]
                  max-md:text-[11px]
                  max-md:leading-[16px]
                "
              >
                {isConfirmed
                  ? 'Os NFTs foram associados à sua carteira.'
                  : isFailed
                    ? 'Nenhum item foi removido do carrinho.'
                    : 'Aguardando conclusão da transação.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="
          mt-5
          grid
          grid-cols-4
          border-y
          border-[var(--color-primary-kurio)]
          px-7
          py-4

          max-md:mt-[20px]
          max-md:grid-cols-2
          max-md:gap-x-[20px]
          max-md:gap-y-[16px]
          max-md:px-[18px]
          max-md:py-[16px]
        "
      >
        <div>
          <p
            className="
              text-[9px]
              text-[var(--color-text-secondary)]

              max-md:text-[11px]
              max-md:leading-[16px]
            "
          >
            ID da transação
          </p>

          <p
            className="
              mt-1.5
              text-[10px]
              font-medium

              max-md:mt-[4px]
              max-md:text-[12px]
              max-md:leading-[16px]
            "
          >
            {formatTransactionHash(
              order.transactionHash,
            )}
          </p>
        </div>

        <div>
          <p
            className="
              text-[9px]
              text-[var(--color-text-secondary)]

              max-md:text-[11px]
              max-md:leading-[16px]
            "
          >
            Data
          </p>

          <p
            className="
              mt-1.5
              text-[10px]
              font-medium

              max-md:mt-[4px]
              max-md:text-[12px]
              max-md:leading-[16px]
            "
          >
            {formatOrderDate(
              order.createdAt,
            )}
          </p>
        </div>

        <div>
          <p
            className="
              text-[9px]
              text-[var(--color-text-secondary)]

              max-md:text-[11px]
              max-md:leading-[16px]
            "
          >
            Total
          </p>

          <p
            className="
              mt-1.5
              text-[10px]
              font-medium

              max-md:mt-[4px]
              max-md:text-[12px]
              max-md:leading-[16px]
            "
          >
            {order.totalEth} ETH
          </p>
        </div>

        <div>
          <p
            className="
              text-[9px]
              text-[var(--color-text-secondary)]

              max-md:text-[11px]
              max-md:leading-[16px]
            "
          >
            Carteira
          </p>

          <p
            className="
              mt-1.5
              text-[10px]
              font-medium

              max-md:mt-[4px]
              max-md:text-[12px]
              max-md:leading-[16px]
            "
          >
            {getWalletProviderLabel(
              order.walletProvider,
            )}
          </p>
        </div>
      </div>

      <div
        className="
          px-7
          py-5

          max-md:px-[16px]
          max-md:py-[20px]
        "
      >
        <p
          className="
            text-[10px]
            font-bold

            max-md:text-[16px]
            max-md:leading-[20px]
          "
        >
          Detalhes da transação
        </p>

        <div
          className="
            mt-4
            grid
            grid-cols-[minmax(0,1fr)_70px_90px]
            gap-4
            text-[9px]
            font-bold

            max-md:hidden
          "
        >
          <span>
            NFTs
          </span>

          <span>
            Edições
          </span>

          <span className="text-right">
            Subtotal
          </span>
        </div>

        <div className="mt-4 space-y-4 max-md:mt-[14px] max-md:space-y-[10px]">
          {order.items.map(
            (item) => (
              <div
                key={item.nftId}
                className="
                  grid
                  grid-cols-[minmax(0,1fr)_70px_90px]
                  items-center
                  gap-4

                  max-md:grid-cols-[minmax(0,1fr)_auto]
                  max-md:gap-x-[12px]
                  max-md:gap-y-[4px]
                  max-md:rounded-[12px]
                  max-md:border
                  max-md:border-[var(--color-border-kurio)]
                  max-md:bg-[var(--color-surface-raised)]
                  max-md:p-[12px]
                "
              >
                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-3

                    max-md:row-span-2
                    max-md:gap-[10px]
                  "
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="
                      size-13.5
                      shrink-0
                      rounded-md
                      object-cover

                      max-md:size-[56px]
                      max-md:rounded-[10px]
                    "
                  />

                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-[11px]
                        font-bold
                        leading-4

                        max-md:text-[14px]
                        max-md:leading-[18px]
                      "
                    >
                      {item.name}
                    </p>

                    <p
                      className="
                        mt-1
                        text-[9px]
                        leading-3
                        text-[var(--color-text-secondary)]

                        max-md:mt-[4px]
                        max-md:text-[11px]
                        max-md:leading-[16px]
                      "
                    >
                      ID do token:{' '}
                      {item.tokenId}
                    </p>
                  </div>
                </div>

                <span
                  className="
                    text-[10px]
                    text-[var(--color-text-secondary)]

                    max-md:col-start-2
                    max-md:row-start-1
                    max-md:self-end
                    max-md:text-[11px]
                    max-md:leading-[16px]
                  "
                >
                  (x {item.quantity})
                </span>

                <span
                  className="
                    text-right
                    text-[11px]
                    font-bold
                    text-[var(--color-text-accent)]

                    max-md:col-start-2
                    max-md:row-start-2
                    max-md:text-[13px]
                    max-md:leading-[18px]
                  "
                >
                  {item.subtotalEth} ETH
                </span>
              </div>
            ),
          )}
        </div>

        <div
          className="
            mt-6
            ml-auto
            grid
            max-w-62.5
            grid-cols-[1fr_auto]
            gap-x-6
            gap-y-2.5
            text-[10px]

            max-md:mt-[18px]
            max-md:max-w-none
            max-md:gap-x-[20px]
            max-md:gap-y-[10px]
            max-md:text-[13px]
            max-md:leading-[18px]
          "
        >
          <span className="text-right">
            Subtotal
          </span>

          <span
            className="
              min-w-21.25
              text-right

              max-md:min-w-0
            "
          >
            {order.subtotalEth} ETH
          </span>

          <span className="text-right">
            Taxa de rede
          </span>

          <span
            className="
              min-w-21.25
              text-right

              max-md:min-w-0
            "
          >
            {order.networkFeeEth} ETH
          </span>

          {order.discountEth !== '0.00' && (
            <>
              <span className="text-right">
                Desconto
              </span>

              <span
                className="
                  min-w-21.25
                  text-right
                  font-medium

                  max-md:min-w-0
                  text-[var(--color-text-accent)]
                "
              >
                (-) {order.discountEth} ETH
              </span>
            </>
          )}

          <span
            className="
              text-right
              font-bold
            "
          >
            Total
          </span>

          <span
            className="
              min-w-21.25
              text-right
              text-[12px]
              font-bold

              max-md:min-w-0
              max-md:text-[18px]
              max-md:leading-[20px]
              text-[var(--color-text-accent)]
            "
          >
            {order.totalEth} ETH
          </span>
        </div>

        <div
          className="
            mt-5
            border-t
            border-[var(--color-border-kurio)]
            pt-4

            max-md:mt-[20px]
            max-md:pt-[18px]
          "
        >
          <p
            className="
              mx-auto
              max-w-97.5
              text-center
              text-[10px]
              leading-4.25
              text-[var(--color-text-secondary)]

              max-md:max-w-[310px]
              max-md:text-[12px]
              max-md:leading-[19px]
            "
          >
            {isConfirmed
              ? (
                <>
                  Transação confirmada na{' '}
                  {networkLabel}. A propriedade
                  foi transferida para sua
                  carteira conectada e registrada
                  na rede.
                </>
              )
              : isFailed
                ? (
                  <>
                    A transação não foi confirmada.
                    Os itens e quantidades
                    permanecem no carrinho.
                  </>
                )
                : (
                  <>
                    A transação está sendo processada
                    na {networkLabel}. O comprovante
                    será atualizado automaticamente
                    assim que houver confirmação.
                  </>
                )}
          </p>

          <div
            className="
              mt-5
              flex
              justify-center

              max-md:mt-[18px]
            "
          >
            <button
              type="button"
              disabled
              title={
                isConfirmed
                  ? 'Transação simulada pelo ambiente de testes'
                  : isFailed
                    ? 'A transação foi recusada'
                    : 'Aguardando confirmação da transação'
              }
              className="
                flex
                h-10
                min-w-41.25
                items-center
                justify-center
                bg-[var(--color-primary-kurio)]
                px-5
                text-[10px]
                font-bold
                text-[var(--color-ink)]
                disabled:cursor-not-allowed

                max-md:h-[52px]
                max-md:w-full
                max-md:rounded-[40px]
                max-md:text-[14px]
                max-md:leading-[16px]
              "
            >
              {isConfirmed
                ? getExplorerLabel(
                    order.network,
                  )
                : isFailed
                  ? 'Transação recusada'
                  : 'Aguardando confirmação'}
            </button>
          </div>
        </div>
      </div>

      <div
        className="
          h-1.5
          bg-[var(--color-primary-kurio)]

          max-md:rounded-b-[24px]
        "
      />
    </article>
  )
}