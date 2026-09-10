import {
  useNavigate,
} from '@tanstack/react-router'

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
    'en-US',
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

  const networkLabel =
    getNetworkLabel(order.network)

  const isConfirmed =
    order.status === 'confirmed'

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
        max-w-[520px]
        overflow-hidden
        border
        border-[var(--color-border-kurio)]
        bg-[var(--color-surface-card)]
        text-foreground
        shadow-2xl
      "
    >
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
        "
      >
        ×
      </button>

      <header
        className="
          px-7
          pb-1
          pt-7
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
          "
        >
          <div
            className="
              flex
              size-[58px]
              items-center
              justify-center
              border
              border-[var(--color-text-accent)]
              text-center
              text-[9px]
              font-bold
              leading-[11px]
              tracking-wide
              text-[var(--color-text-accent)]
            "
          >
            THANK
            <br />
            YOU
          </div>

          <p
            className="
              mt-4
              text-center
              text-[12px]
              font-bold
              leading-5
            "
          >
            Pedido realizado com sucesso
          </p>

          <p
            className="
              mt-1
              max-w-[340px]
              text-center
              text-[10px]
              leading-4
              text-[var(--color-text-secondary)]
            "
          >
            Acompanhe abaixo o processamento
            da sua transação.
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
        "
      >
        <p
          className="
            text-[9px]
            font-bold
            uppercase
            tracking-[0.12em]
            text-[var(--color-text-secondary)]
          "
        >
          Status do pedido
        </p>

        <div className="mt-4 space-y-3">
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
                "
              >
                Pedido recebido
              </p>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  text-[var(--color-text-secondary)]
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
                : '•'}
            </span>

            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                "
              >
                Processando transação
              </p>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  text-[var(--color-text-secondary)]
                "
              >
                {isConfirmed
                  ? 'Processamento concluído.'
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
                : '3'}
            </span>

            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                "
              >
                Confirmado
              </p>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  text-[var(--color-text-secondary)]
                "
              >
                {isConfirmed
                  ? 'Os NFTs foram associados à sua carteira.'
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
        "
      >
        <div>
          <p
            className="
              text-[9px]
              text-[var(--color-text-secondary)]
            "
          >
            ID da transação
          </p>

          <p
            className="
              mt-1.5
              text-[10px]
              font-medium
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
            "
          >
            Data
          </p>

          <p
            className="
              mt-1.5
              text-[10px]
              font-medium
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
            "
          >
            Total
          </p>

          <p
            className="
              mt-1.5
              text-[10px]
              font-medium
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
            "
          >
            Carteira
          </p>

          <p
            className="
              mt-1.5
              text-[10px]
              font-medium
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
        "
      >
        <p
          className="
            text-[10px]
            font-bold
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

        <div className="mt-4 space-y-4">
          {order.items.map(
            (item) => (
              <div
                key={item.nftId}
                className="
                  grid
                  grid-cols-[minmax(0,1fr)_70px_90px]
                  items-center
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                  "
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="
                      size-[54px]
                      shrink-0
                      rounded-[6px]
                      object-cover
                    "
                  />

                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-[11px]
                        font-bold
                        leading-4
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
            max-w-[250px]
            grid-cols-[1fr_auto]
            gap-x-6
            gap-y-2.5
            text-[10px]
          "
        >
          <span className="text-right">
            Taxa de rede
          </span>

          <span
            className="
              min-w-[85px]
              text-right
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
                  min-w-[85px]
                  text-right
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
              min-w-[85px]
              text-right
              text-[12px]
              font-bold
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
          "
        >
          <p
            className="
              mx-auto
              max-w-[390px]
              text-center
              text-[10px]
              leading-[17px]
              text-[var(--color-text-secondary)]
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
            "
          >
            <button
              type="button"
              disabled
              title={
                isConfirmed
                  ? 'Transação simulada pelo ambiente de testes'
                  : 'Aguardando confirmação da transação'
              }
              className="
                flex
                h-10
                min-w-[165px]
                items-center
                justify-center
                bg-[var(--color-primary-kurio)]
                px-5
                text-[10px]
                font-bold
                text-[var(--color-ink)]
                disabled:cursor-not-allowed
              "
            >
              {isConfirmed
                ? getExplorerLabel(
                    order.network,
                  )
                : 'Aguardando confirmação'}
            </button>
          </div>
        </div>
      </div>

      <div
        className="
          h-[6px]
          bg-[var(--color-primary-kurio)]
        "
      />
    </article>
  )
}