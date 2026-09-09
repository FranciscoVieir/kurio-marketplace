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
  const networkLabel =
    getNetworkLabel(order.network)

  return (
    <article
      className="
        w-full
        max-w-[470px]
        overflow-hidden
        border
        border-[var(--color-border-kurio)]
        bg-[var(--color-surface-card)]
        text-foreground
      "
    >
      <header className="px-5 pt-5">
        <div className="flex justify-end">
          <span
            aria-hidden="true"
            className="text-[11px] text-[var(--color-text-accent)]"
          >
            ×
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div
            className="
              flex size-12
              items-center justify-center
              border
              border-[var(--color-text-accent)]
              text-center
              text-[8px] font-bold
              leading-tight
              text-[var(--color-text-accent)]
            "
          >
            THANK
            <br />
            YOU
          </div>

          <p className="mt-3 text-center text-[10px] font-bold">
            Seus NFTs agora estão na sua carteira
          </p>
        </div>
      </header>

      <div
        className="
          mt-4
          grid grid-cols-4
          border-y
          border-[var(--color-primary-kurio)]
          px-5 py-3
        "
      >
        <div>
          <p className="text-[7px] text-[var(--color-text-secondary)]">
            ID da transação
          </p>

          <p className="mt-1 text-[8px] text-foreground">
            {formatTransactionHash(
              order.transactionHash,
            )}
          </p>
        </div>

        <div>
          <p className="text-[7px] text-[var(--color-text-secondary)]">
            Data
          </p>

          <p className="mt-1 text-[8px] text-foreground">
            {formatOrderDate(
              order.createdAt,
            )}
          </p>
        </div>

        <div>
          <p className="text-[7px] text-[var(--color-text-secondary)]">
            Total
          </p>

          <p className="mt-1 text-[8px] text-foreground">
            {order.totalEth} ETH
          </p>
        </div>

        <div>
          <p className="text-[7px] text-[var(--color-text-secondary)]">
            Carteira
          </p>

          <p className="mt-1 text-[8px] text-foreground">
            {getWalletProviderLabel(
              order.walletProvider,
            )}
          </p>
        </div>
      </div>

      <div className="px-5 py-4">
        <p className="text-[8px] font-bold">
          Detalhes da transação
        </p>

        <div
          className="
            mt-3
            grid grid-cols-[minmax(0,1fr)_60px_78px]
            gap-3
            text-[8px]
            font-bold
          "
        >
          <span>NFTs</span>

          <span>
            Edições
          </span>

          <span>
            Subtotal
          </span>
        </div>

        <div className="mt-3 space-y-3">
          {order.items.map((item) => (
            <div
              key={item.nftId}
              className="
                grid
                grid-cols-[minmax(0,1fr)_60px_78px]
                items-center
                gap-3
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="
                    size-11
                    shrink-0
                    rounded-[6px]
                    object-cover
                  "
                />

                <div className="min-w-0">
                  <p className="truncate text-[9px] font-bold">
                    {item.name}
                  </p>

                  <p className="mt-1 text-[7px] text-[var(--color-text-secondary)]">
                    ID do token:{' '}
                    {item.tokenId}
                  </p>
                </div>
              </div>

              <span className="text-[8px] text-[var(--color-text-secondary)]">
                (x {item.quantity})
              </span>

              <span className="text-[9px] font-bold text-[var(--color-text-accent)]">
                {item.subtotalEth} ETH
              </span>
            </div>
          ))}
        </div>

        <div
          className="
            mt-5
            ml-auto
            grid
            max-w-[220px]
            grid-cols-[1fr_auto]
            gap-x-5 gap-y-2
            text-[8px]
          "
        >
          <span className="text-right">
            Taxa de rede
          </span>

          <span className="text-right">
            {order.networkFeeEth} ETH
          </span>

          {order.discountEth !== '0.00' && (
            <>
              <span className="text-right">
                Desconto
              </span>

              <span className="text-right">
                (-) {order.discountEth} ETH
              </span>
            </>
          )}

          <span className="text-right font-bold">
            Total
          </span>

          <span className="text-right font-bold text-[var(--color-text-accent)]">
            {order.totalEth} ETH
          </span>
        </div>

        <div
          className="
            mt-4
            border-t
            border-[var(--color-border-kurio)]
            pt-3
          "
        >
          <p
            className="
              mx-auto
              max-w-[330px]
              text-center
              text-[8px]
              leading-relaxed
              text-[var(--color-text-secondary)]
            "
          >
            Transação confirmada na{' '}
            {networkLabel}. A propriedade
            foi transferida para sua
            carteira conectada e registrada
            na rede.
          </p>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              disabled
              title="Transação simulada pelo ambiente de testes"
              className="
                h-9
                bg-[var(--color-primary-kurio)]
                px-5
                text-[9px] font-bold
                text-[var(--color-ink)]
                opacity-90
              "
            >
              {getExplorerLabel(
                order.network,
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="h-[5px] bg-[var(--color-primary-kurio)]" />
    </article>
  )
}