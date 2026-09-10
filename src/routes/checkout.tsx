import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from '@tanstack/react-router'

import axios from 'axios'

import { Header } from '@/components/layout/header'
import { PageContainer } from '@/components/layout/page-container'
import { useCart } from '@/features/cart/hooks/use-cart'
import { CollectorProfileForm } from '@/features/checkout/components/collector-profile-form'
import { WalletProviderSelector } from '@/features/checkout/components/wallet-provider-selector'
import { useCheckoutQuote } from '@/features/checkout/hooks/use-checkout-quote'
import { useCreateOrder } from '@/features/checkout/hooks/use-create-order'
import { useWallets } from '@/features/wallets/hooks/use-wallets'

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

type OrderErrorResponse = {
  code?: string
  message?: string
}

type WalletConnectionStatus =
  | 'disconnected'
  | 'connected'
  | 'refused'

function isCheckoutWalletProvider(
  value: string,
): value is CheckoutWalletProvider {
  return (
    value === 'metamask' ||
    value === 'coinbase'
  )
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

function getOrderErrorMessage(
  error: unknown,
) {
  if (!axios.isAxiosError<OrderErrorResponse>(error)) {
    return 'Não foi possível concluir a compra. Tente novamente.'
  }

  const responseData =
    error.response?.data

  const code =
    responseData?.code

  switch (code) {
    case 'QUOTE_EXPIRED':
      return (
        responseData?.message ??
        'A cotação expirou. Gere uma nova cotação antes de finalizar a compra.'
      )

    case 'INSUFFICIENT_STOCK':
      return (
        responseData?.message ??
        'A quantidade disponível de um dos NFTs foi alterada antes da confirmação da compra.'
      )

    case 'NFT_PRICE_CHANGED':
      return (
        responseData?.message ??
        'O preço de um dos NFTs foi alterado após a criação da cotação.'
      )

    case 'NFT_CHANGED':
      return (
        responseData?.message ??
        'Um dos NFTs foi atualizado após a criação da cotação.'
      )

    case 'SESSION_EXPIRED':
      return (
        responseData?.message ??
        'Sua sessão expirou. Entre novamente para continuar.'
      )

    case 'UNAUTHENTICATED':
      return (
        responseData?.message ??
        'Você precisa estar autenticado para finalizar a compra.'
      )

    case 'NETWORK_MISMATCH':
      return (
        responseData?.message ??
        'A rede selecionada não corresponde à rede da cotação.'
      )

    case 'QUOTE_NOT_FOUND':
      return (
        responseData?.message ??
        'A cotação informada não existe mais.'
      )

    case 'NFT_NOT_FOUND':
      return (
        responseData?.message ??
        'Um dos NFTs da cotação não está mais disponível.'
      )

    default:
      return (
        responseData?.message ??
        'Não foi possível concluir a compra. Tente novamente.'
      )
  }
}

export function CheckoutPage() {
  const navigate = useNavigate()

  const {
    items,
    isEmpty,
    clearCart,
  } = useCart()

  const {
    data: quote,
    isPending: isQuotePending,
    isError: isQuoteError,
    mutate: createQuote,
    reset: resetQuote,
  } = useCheckoutQuote()

  const {
    isPending: isOrderPending,
    mutate: submitOrder,
  } = useCreateOrder()

  const {
    data: wallets = [],
    isPending: isWalletsPending,
  } = useWallets()

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
    selectedWalletId,
    setSelectedWalletId,
  ] = useState('')

  const [
    walletConnectionStatus,
    setWalletConnectionStatus,
  ] = useState<WalletConnectionStatus>(
    'disconnected',
  )

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(null)

  const hasRequestedQuote =
    useRef(false)

  const hasInitializedNetwork =
    useRef(false)

  const hasInitializedWallet =
    useRef(false)

  const idempotencyKeyRef =
    useRef<string | null>(null)

  const compatibleWallets =
    quote
      ? wallets.filter(
          (wallet) =>
            wallet.network ===
            quote.network,
        )
      : wallets

  const selectedWallet =
    wallets.find(
      (wallet) =>
        wallet.id ===
        selectedWalletId,
    )

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

  useEffect(() => {
    if (
      !quote ||
      hasInitializedWallet.current ||
      wallets.length === 0
    ) {
      return
    }

    const preferredWallet =
      wallets.find(
        (wallet) =>
          wallet.role ===
            'primary' &&
          wallet.network ===
            quote.network,
      ) ??
      wallets.find(
        (wallet) =>
          wallet.network ===
          quote.network,
      )

    if (!preferredWallet) {
      return
    }

    hasInitializedWallet.current = true

    setSelectedWalletId(
      preferredWallet.id,
    )

    setProfile(
      (currentProfile) => ({
        ...currentProfile,

        displayName:
          preferredWallet.displayName,

        username:
          preferredWallet.nickname,

        network:
          preferredWallet.network,

        profileName:
          preferredWallet.profileName,

        walletAddress:
          preferredWallet.address,

        secondaryWallet:
          preferredWallet.secondaryAddress ??
          '',

        walletType:
          preferredWallet.provider,

        referralCode:
          preferredWallet.referralCode ??
          '',

        email:
          preferredWallet.email,

        ensName:
          preferredWallet.ensName ??
          '',
      }),
    )

    if (
      isCheckoutWalletProvider(
        preferredWallet.provider,
      )
    ) {
      setWalletProvider(
        preferredWallet.provider,
      )
    }
  }, [
    quote,
    wallets,
  ])

  function handleWalletSelection(
    walletId: string,
  ) {
    setSelectedWalletId(
      walletId,
    )

    setWalletConnectionStatus(
      'disconnected',
    )

    const wallet =
      wallets.find(
        (candidate) =>
          candidate.id ===
          walletId,
      )

    if (!wallet) {
      return
    }

    setProfile(
      (currentProfile) => ({
        ...currentProfile,

        displayName:
          wallet.displayName,

        username:
          wallet.nickname,

        network:
          wallet.network,

        profileName:
          wallet.profileName,

        walletAddress:
          wallet.address,

        secondaryWallet:
          wallet.secondaryAddress ??
          '',

        walletType:
          wallet.provider,

        referralCode:
          wallet.referralCode ??
          '',

        email:
          wallet.email,

        ensName:
          wallet.ensName ??
          '',
      }),
    )

    if (
      isCheckoutWalletProvider(
        wallet.provider,
      )
    ) {
      setWalletProvider(
        wallet.provider,
      )
    }

    setSubmitError(null)
    idempotencyKeyRef.current =
      null
  }

  function handleConnectWallet() {
    if (!selectedWallet) {
      setSubmitError(
        'Selecione uma carteira cadastrada antes de conectar.',
      )

      return
    }

    setWalletConnectionStatus(
      'connected',
    )

    setSubmitError(null)
  }

  function handleRefuseWalletConnection() {
    setWalletConnectionStatus(
      'refused',
    )

    setSubmitError(
      'A conexão com a carteira foi recusada. Tente novamente ou escolha outra carteira.',
    )
  }

  function handleDisconnectWallet() {
    setWalletConnectionStatus(
      'disconnected',
    )

    setSubmitError(null)
  }

  function handleRetryQuote() {
    resetQuote()

    setSubmitError(null)

    idempotencyKeyRef.current =
      null

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

    if (
      walletConnectionStatus !==
      'connected'
    ) {
      setSubmitError(
        'Conecte uma carteira cadastrada antes de confirmar a compra.',
      )

      return
    }

    if (!isProfileValid(profile)) {
      setSubmitError(
        'Preencha todos os campos obrigatórios antes de confirmar a compra.',
      )

      return
    }

    if (
      profile.network !==
      quote.network
    ) {
      setSubmitError(
        `A rede selecionada deve ser ${quote.network}.`,
      )

      return
    }

    setSubmitError(null)

    if (
      !idempotencyKeyRef.current
    ) {
      idempotencyKeyRef.current =
        createIdempotencyKey()
    }

    submitOrder(
      {
        payload: {
          quoteId:
            quote.quoteId,

          profile,

          walletProvider,
        },

        idempotencyKey:
          idempotencyKeyRef.current,
      },
      {
        onSuccess: (order) => {
          setSubmitError(null)

          clearCart()

          void navigate({
            to: '/orders/$orderId',

            params: {
              orderId:
                order.id,
            },
          })
        },

        onError: (error) => {
          setSubmitError(
            getOrderErrorMessage(
              error,
            ),
          )
        },
      },
    )
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

          {!isEmpty &&
            isQuotePending && (
              <div className="py-20 text-center">
                <p className="text-sm font-bold text-foreground">
                  Validando seu
                  carrinho...
                </p>

                <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">
                  Estamos verificando
                  preços e
                  disponibilidade dos
                  NFTs.
                </p>
              </div>
            )}

          {!isEmpty &&
            isQuoteError && (
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
                  Não foi possível
                  validar o carrinho
                </h1>

                <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">
                  Um ou mais NFTs podem
                  ter sido alterados ou
                  ficado indisponíveis.
                </p>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={
                      handleRetryQuote
                    }
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

          {!isEmpty &&
            quote && (
              <section>
                <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-12">
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      Perfil do
                      colecionador
                    </h1>

                    <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">
                      Preencha os dados
                      necessários para
                      concluir sua
                      compra.
                    </p>

                    <div className="mt-6 border border-[var(--color-border-kurio)] bg-[var(--color-surface-card)] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-[12px] font-bold text-foreground">
                            Carteira cadastrada
                          </h2>

                          <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
                            Escolha uma carteira compatível com a rede da cotação e simule a conexão antes de pagar.
                          </p>
                        </div>

                        <span
                          aria-live="polite"
                          className="text-[9px] font-bold uppercase text-[var(--color-text-secondary)]"
                        >
                          {walletConnectionStatus ===
                          'connected'
                            ? 'Conectada'
                            : walletConnectionStatus ===
                                'refused'
                              ? 'Recusada'
                              : 'Desconectada'}
                        </span>
                      </div>

                      <label className="mt-4 block text-[10px] font-bold text-foreground">
                        Carteira
                      </label>

                      <select
                        value={
                          selectedWalletId
                        }
                        onChange={(event) => {
                          handleWalletSelection(
                            event.target.value,
                          )
                        }}
                        disabled={
                          isWalletsPending ||
                          isOrderPending
                        }
                        className="mt-2 h-10 w-full border border-[var(--color-border-kurio)] bg-background px-3 text-[11px] text-foreground outline-none"
                      >
                        <option value="">
                          {isWalletsPending
                            ? 'Carregando carteiras...'
                            : compatibleWallets.length >
                                0
                              ? 'Selecione uma carteira'
                              : 'Nenhuma carteira compatível'}
                        </option>

                        {compatibleWallets.map(
                          (wallet) => (
                            <option
                              key={
                                wallet.id
                              }
                              value={
                                wallet.id
                              }
                            >
                              {
                                wallet.nickname
                              }{' '}
                              ·{' '}
                              {
                                wallet.network
                              }{' '}
                              ·{' '}
                              {
                                wallet.address
                              }
                            </option>
                          ),
                        )}
                      </select>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {walletConnectionStatus !==
                        'connected' ? (
                          <>
                            <button
                              type="button"
                              onClick={
                                handleConnectWallet
                              }
                              disabled={
                                !selectedWallet ||
                                isOrderPending
                              }
                              className="h-8 bg-[var(--color-primary-kurio)] px-4 text-[10px] font-bold text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Conectar carteira
                            </button>

                            <button
                              type="button"
                              onClick={
                                handleRefuseWalletConnection
                              }
                              disabled={
                                !selectedWallet ||
                                isOrderPending
                              }
                              className="h-8 border border-[var(--color-border-kurio)] px-4 text-[10px] font-bold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Simular recusa
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={
                              handleDisconnectWallet
                            }
                            disabled={
                              isOrderPending
                            }
                            className="h-8 border border-[var(--color-border-kurio)] px-4 text-[10px] font-bold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Desconectar
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <CollectorProfileForm
                      value={profile}
                      onChange={(
                        nextProfile,
                      ) => {
                        setProfile(
                          nextProfile,
                        )

                        if (
                          submitError
                        ) {
                          setSubmitError(
                            null,
                          )
                        }
                      }}
                      disabled={
                        isOrderPending
                      }
                    />
                    </div>
                  </div>

                  <aside>
                    <h2 className="text-base font-bold text-foreground">
                      Seus NFTs
                    </h2>

                    <div className="mt-5 space-y-4">
                      {quote.items.map(
                        (item) => (
                          <div
                            key={
                              item.nftId
                            }
                            className="
                              flex items-center
                              gap-3
                              border-b
                              border-[var(--color-border-kurio)]
                              pb-4
                            "
                          >
                            <img
                              src={
                                item.imageUrl
                              }
                              alt={
                                item.name
                              }
                              className="size-14 rounded-[6px] object-cover"
                            />

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-bold text-foreground">
                                {
                                  item.name
                                }
                              </p>

                              <p className="mt-1 text-[9px] text-[var(--color-text-secondary)]">
                                {
                                  item.tokenId
                                }{' '}
                                · Qtd.{' '}
                                {
                                  item.quantity
                                }
                              </p>
                            </div>

                            <span className="text-[10px] font-bold text-foreground">
                              {
                                item.subtotalEth
                              }{' '}
                              ETH
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
                          {
                            quote.subtotalEth
                          }{' '}
                          ETH
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span>
                          Desconto
                        </span>

                        <span>
                          (-){' '}
                          {
                            quote.discountEth
                          }{' '}
                          ETH
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span>
                          Taxa de rede
                        </span>

                        <span>
                          {
                            quote.networkFeeEth
                          }{' '}
                          ETH
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
                        {
                          quote.totalEth
                        }{' '}
                        ETH
                      </span>
                    </div>

                    <div className="mt-7">
                      <WalletProviderSelector
                        value={
                          walletProvider
                        }
                        onChange={
                          setWalletProvider
                        }
                        disabled={
                          isOrderPending
                        }
                      />
                    </div>

                    {submitError && (
                      <p
                        role="alert"
                        className="mt-4 text-[10px] text-destructive"
                      >
                        {
                          submitError
                        }
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={
                        handleConfirmPurchase
                      }
                      disabled={
                        isOrderPending
                      }
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
                  </aside>
                </div>
              </section>
            )}
        </PageContainer>
      </main>
    </div>
  )
}