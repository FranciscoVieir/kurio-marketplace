import type { CheckoutWalletProvider } from '../types/checkout'

type WalletProviderSelectorProps = {
  value: CheckoutWalletProvider
  onChange: (
    provider: CheckoutWalletProvider,
  ) => void
  disabled?: boolean
}

const walletProviders: Array<{
  value: CheckoutWalletProvider
  label: string
  description: string
}> = [
  {
    value: 'metamask',
    label: 'MetaMask',
    description:
      'Conectar usando a carteira MetaMask',
  },
  {
    value: 'coinbase',
    label: 'Coinbase Wallet',
    description:
      'Conectar usando a Coinbase Wallet',
  },
]

export function WalletProviderSelector({
  value,
  onChange,
  disabled = false,
}: WalletProviderSelectorProps) {
  return (
    <div>
      <h2 className="text-[12px] font-bold text-foreground">
        Carteira e rede
      </h2>

      <div className="mt-3 space-y-2">
        {walletProviders.map(
          (provider) => {
            const isSelected =
              value === provider.value

            return (
              <label
                key={provider.value}
                className="
                  flex cursor-pointer
                  items-center gap-3
                  border
                  border-[var(--color-border-kurio)]
                  px-3 py-2.5
                "
              >
                <input
                  type="radio"
                  name="wallet-provider"
                  value={provider.value}
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => {
                    onChange(
                      provider.value,
                    )
                  }}
                  className="size-3.5"
                />

                <span className="min-w-0">
                  <span className="block text-[10px] font-bold text-foreground">
                    {provider.label}
                  </span>

                  <span className="mt-0.5 block text-[8px] text-[var(--color-text-secondary)]">
                    {provider.description}
                  </span>
                </span>
              </label>
            )
          },
        )}
      </div>
    </div>
  )
}