import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link } from '@tanstack/react-router'

import { Header } from '@/components/layout/header'
import { PageContainer } from '@/components/layout/page-container'
import { useCart } from '@/features/cart/hooks/use-cart'
import { CollectorProfileForm } from '@/features/checkout/components/collector-profile-form'
import { WalletProviderSelector } from '@/features/checkout/components/wallet-provider-selector'
import { useCheckoutQuote } from '@/features/checkout/hooks/use-checkout-quote'
import { useCreateOrder } from '@/features/checkout/hooks/use-create-order'

import type {
  CheckoutWalletProvider,
  CollectorProfileInput,
} from '@/features/checkout/types/checkout'

const INITIAL_COLLECTOR_PROFILE: CollectorProfileInput = {
  displayName: '',
  username: '',
  network: 'ethereum',
  profileName: '',
  walletAddress: '',
  secondaryWallet: '',
  walletType: '',
  referralCode: '',
  email: '',
  ensName: '',
  useAnotherWallet: false,
  collectionNote: '',
}

function isProfileValid(
  profile: CollectorProfileInput,
) {
  return Boolean(
    profile.displayName.trim() &&
      profile.username.trim() &&
      profile.network &&
      profile.profileName.trim() &&
      profile.walletAddress.trim() &&
      profile.walletType.trim() &&
      profile.email.trim(),
  )
}

function createIdempotencyKey() {
  return `checkout_${crypto.randomUUID()}`
}

export function CheckoutPage() {
  const {
    items,
    isEmpty,
  } = useCart()

  const {
    data: quote,
    isPending: isQuotePending,
    isError: isQuoteError,
    mutate: createQuote,
    reset: resetQuote,
  } = useCheckoutQuote()

  const {
    data: order,
    isPending: isOrderPending,
    isError: isOrderError,
    mutate: submitOrder,
  } = useCreateOrder()

  const [profile, setProfile] =
    useState<CollectorProfileInput>(
      INITIAL_COLLECTOR_PROFILE,
    )

  const [
    walletProvider,
    setWalletProvider,
  ] = useState<CheckoutWalletProvider>(
    'metamask',
  )

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(null)

  const hasRequestedQuote = useRef(false)
  const hasInitializedNetwork = useRef(false)

  const idempotencyKeyRef =
    useRef<string | null>(null)

  useEffect(() => {
    if (
      isEmpty ||
      hasRequestedQuote.current
    ) {
      return
    }

    hasRequestedQuote.current = true

    createQuote({
      items: items.map((item) => ({
        nftId: item.nftId,
        quantity: item.quantity,
        version: item.version,
      })),
    })
  }, [
    createQuote,
    isEmpty,
    items,
  ])

  useEffect(() => {
    if (
      !quote ||
      hasInitializedNetwork.current
    ) {
      return
    }

    hasInitializedNetwork.current = true

    setProfile((currentProfile) => ({
      ...currentProfile,
      network: quote.network,
    }))
  }, [quote])

  function handleRetryQuote() {
    resetQuote()

    idempotencyKeyRef.current = null

    createQuote({
      items: items.map((item) => ({
        nftId: item.nftId,
        quantity: item.quantity,
        version: item.version,
      })),
    })
  }

  function handleConfirmPurchase() {
    if (!quote) {
      return
    }

    if (!isProfileValid(profile)) {
      setSubmitError(
        'Preencha todos os campos obrigatórios antes de confirmar a compra.',
      )
      return
    }

    if (
      profile.network !== quote.network
    ) {
      setSubmitError(
        `A rede selecionada deve ser ${quote.network}.`,
      )
      return
    }

    setSubmitError(null)

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        createIdempotencyKey()
    }

    submitOrder({
      payload: {
        quoteId: quote.quoteId,
        profile,
        walletProvider,
      },
      idempotencyKey:
        idempotencyKeyRef.current,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <PageContainer className="pt-6">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Link
              to="/"
              className="transition-colors hover:text-[var(--color-text-accent)]"
            >
              Início
            </Link>

            <span>/</span>

            <span>Mercado</span>

            <span>/</span>

            <span className="text-foreground">
              Pagamento
            </span>
          </div>
        </PageContainer>

        <PageContainer className="py-10">
          {isEmpty && (
            <div
              className="
                border
                border-[var(--color-border-kurio)]
                bg-[var(--color-surface-card)]
                p-8
              "
            >
              <h1 className="text-lg font-bold text-foreground">
                Seu carrinho está vazio
              </h1>

              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Adicione NFTs ao carrinho antes de iniciar o pagamento.
              </p>

              <Link
                to="/"
                className="
                  mt-6
                  inline-flex h-9
                  items-center justify-center
                  bg-[var(--color-primary-kurio)]
                  px-5
                  text-[11px] font-bold
                  text-[var(--color-ink)]
                "
              >
                Explorar NFTs
              </Link>
            </div>
          )}

          {!isEmpty && isQuotePending && (
            <div className="py-20 text-center">
              <p className="text-sm font-bold text-foreground">
                Validando seu carrinho...
              </p>

              <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">
                Estamos verificando preços e disponibilidade dos NFTs.
              </p>
            </div>
          )}

          {!isEmpty && isQuoteError && (
            <div
              role="alert"
              className="
                border
                border-destructive
                bg-[var(--color-surface-card)]
                p-6
              "
            >
              <h1 className="text-base font-bold text-foreground">
                Não foi possível validar o carrinho
              </h1>

              <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">
                Um ou mais NFTs podem ter sido alterados ou ficado indisponíveis.
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={handleRetryQuote}
                  className="
                    h-9
                    bg-[var(--color-primary-kurio)]
                    px-5
                    text-[11px] font-bold
                    text-[var(--color-ink)]
                  "
                >
                  Tentar novamente
                </button>

                <Link
                  to="/cart"
                  className="
                    flex h-9
                    items-center justify-center
                    border
                    border-[var(--color-border-kurio)]
                    px-5
                    text-[11px]
                    text-foreground
                  "
                >
                  Voltar ao carrinho
                </Link>
              </div>
            </div>
          )}

          {!isEmpty && quote && (
            <section>
              <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-12">
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    Perfil do colecionador
                  </h1>

                  <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">
                    Preencha os dados necessários para concluir sua compra.
                  </p>

                  <CollectorProfileForm
                    value={profile}
                    onChange={(nextProfile) => {
                      setProfile(nextProfile)

                      if (submitError) {
                        setSubmitError(null)
                      }
                    }}
                    disabled={isOrderPending}
                  />
                </div>

                <aside>
                  <h2 className="text-base font-bold text-foreground">
                    Seus NFTs
                  </h2>

                  <div className="mt-5 space-y-4">
                    {quote.items.map(
                      (item) => (
                        <div
                          key={item.nftId}
                          className="
                            flex items-center
                            gap-3
                            border-b
                            border-[var(--color-border-kurio)]
                            pb-4
                          "
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="size-14 rounded-[6px] object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-bold text-foreground">
                              {item.name}
                            </p>

                            <p className="mt-1 text-[9px] text-[var(--color-text-secondary)]">
                              {item.tokenId} · Qtd.{' '}
                              {item.quantity}
                            </p>
                          </div>

                          <span className="text-[10px] font-bold text-foreground">
                            {item.subtotalEth} ETH
                          </span>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="mt-5 space-y-2.5 text-[10px]">
                    <div className="flex justify-between gap-4">
                      <span>
                        Subtotal
                      </span>

                      <span>
                        {quote.subtotalEth} ETH
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span>
                        Desconto
                      </span>

                      <span>
                        (-) {quote.discountEth} ETH
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span>
                        Taxa de rede
                      </span>

                      <span>
                        {quote.networkFeeEth} ETH
                      </span>
                    </div>
                  </div>

                  <div
                    className="
                      mt-4
                      flex items-center
                      justify-between
                      border-t
                      border-[var(--color-border-kurio)]
                      pt-4
                    "
                  >
                    <span className="text-[11px] font-bold">
                      Total
                    </span>

                    <span className="text-[13px] font-bold text-[var(--color-text-accent)]">
                      {quote.totalEth} ETH
                    </span>
                  </div>

                  <div className="mt-7">
                    <WalletProviderSelector
                      value={walletProvider}
                      onChange={
                        setWalletProvider
                      }
                      disabled={isOrderPending}
                    />
                  </div>

                  {submitError && (
                    <p
                      role="alert"
                      className="mt-4 text-[10px] text-destructive"
                    >
                      {submitError}
                    </p>
                  )}

                  {isOrderError && (
                    <p
                      role="alert"
                      className="mt-4 text-[10px] text-destructive"
                    >
                      Não foi possível concluir a compra. Tente novamente.
                    </p>
                  )}

                  {!order && (
                    <button
                      type="button"
                      onClick={
                        handleConfirmPurchase
                      }
                      disabled={isOrderPending}
                      className="
                        mt-5
                        h-10 w-full
                        bg-[var(--color-primary-kurio)]
                        text-[11px] font-bold
                        text-[var(--color-ink)]
                        transition-opacity
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {isOrderPending
                        ? 'Confirmando compra...'
                        : 'Confirmar compra'}
                    </button>
                  )}

                  {order && (
                    <div
                      role="status"
                      className="
                        mt-5
                        border
                        border-[var(--color-primary-kurio)]
                        p-4
                      "
                    >
                      <p className="text-[11px] font-bold text-[var(--color-text-accent)]">
                        Compra confirmada
                      </p>

                      <p className="mt-2 text-[9px] text-[var(--color-text-secondary)]">
                        Pedido {order.id}
                      </p>

                      <p className="mt-1 text-[9px] text-[var(--color-text-secondary)]">
                        Status: {order.status}
                      </p>
                    </div>
                  )}
                </aside>
              </div>
            </section>
          )}
        </PageContainer>
      </main>
    </div>
  )
}