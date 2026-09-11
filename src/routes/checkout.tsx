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
import {
  Check,
  ChevronRight,
  CircleAlert,
  LoaderCircle,
  RefreshCw,
  Wallet,
} from 'lucide-react'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { PageContainer } from '@/components/layout/page-container'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCart } from '@/features/cart/hooks/use-cart'
import { CollectorProfileForm } from '@/features/checkout/components/collector-profile-form'
import { useCheckoutQuote } from '@/features/checkout/hooks/use-checkout-quote'
import { useCreateOrder } from '@/features/checkout/hooks/use-create-order'
import { BenefitsSection } from '@/features/home/components/benefits-section'
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

function formatNetwork(
  network: string,
) {
  switch (
    network.toLowerCase()
  ) {
    case 'ethereum':
      return 'Ethereum'

    case 'polygon':
      return 'Polygon'

    case 'solana':
      return 'Solana'

    default:
      return network
  }
}

function formatWalletProvider(
  provider: string,
) {
  switch (
    provider.toLowerCase()
  ) {
    case 'metamask':
      return 'MetaMask'

    case 'coinbase':
      return 'Coinbase Wallet'

    case 'walletconnect':
      return 'WalletConnect'

    default:
      return provider
  }
}

function formatWalletAddress(
  address: string,
) {
  if (
    address.length <= 16
  ) {
    return address
  }

  return `${address.slice(
    0,
    8,
  )}...${address.slice(-6)}`
}

function getOrderErrorMessage(
  error: unknown,
) {
  if (
    !axios.isAxiosError<OrderErrorResponse>(
      error,
    )
  ) {
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

function CheckoutSkeleton() {
  return (
    <div
      className="
        grid
        grid-cols-[minmax(0,1fr)_320px]
        items-start
        gap-12
      "
    >
      <div>
        <div
          className="
            h-8.5
            w-62.5
            rounded-[5px]
            bg-[var(--color-surface-card)]
            kurio-shimmer
          "
        />

        <div
          className="
            mt-2.5
            h-4.5
            w-97.5
            max-w-full
            rounded-sm
            bg-[var(--color-surface-card)]
            kurio-shimmer
          "
        />

        <div
          className="
            mt-7
            grid
            grid-cols-2
            gap-x-6
            gap-y-5
          "
        >
          {Array.from({
            length: 10,
          }).map(
            (_, index) => (
              <div
                key={index}
              >
                <div
                  className="
                    h-[14px]
                    w-30
                    rounded-[3px]
                    bg-[var(--color-surface-card)]
                    kurio-shimmer
                  "
                />

                <div
                  className="
                    mt-2
                    h-10
                    w-full
                    rounded-md
                    bg-[var(--color-surface-card)]
                    kurio-shimmer
                  "
                />
              </div>
            ),
          )}
        </div>

        <div
          className="
            mt-6
            h-27.5
            w-full
            rounded-md
            bg-[var(--color-surface-card)]
            kurio-shimmer
          "
        />
      </div>

      <div>
        <div
          className="
            h-5.5
            w-25
            rounded-sm
            bg-[var(--color-surface-card)]
            kurio-shimmer
          "
        />

        <div
          className="
            mt-4.5
            space-y-[8px]
          "
        >
          {Array.from({
            length: 3,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="
                  h-16.5
                  w-full
                  rounded-md
                  bg-[var(--color-surface-card)]
                  kurio-shimmer
                "
              />
            ),
          )}
        </div>

        <div
          className="
            mt-5
            h-32
            w-full
            rounded-md
            bg-[var(--color-surface-card)]
            kurio-shimmer
          "
        />

        <div
          className="
            mt-5.5
            h-40
            w-full
            rounded-md
            bg-[var(--color-surface-card)]
            kurio-shimmer
          "
        />
      </div>
    </div>
  )
}

export function CheckoutPage() {
  const navigate =
    useNavigate()

  const {
    items,
    isEmpty,
    clearCart,
    couponCode,
  } = useCart()

  const {
    data: quote,
    isPending:
      isQuotePending,
    isError:
      isQuoteError,
    mutate: createQuote,
    reset: resetQuote,
  } = useCheckoutQuote()

  const {
    isPending:
      isOrderPending,
    mutate: submitOrder,
  } = useCreateOrder()

  const {
    data: wallets = [],
    isPending:
      isWalletsPending,
  } = useWallets()

  const [
    profile,
    setProfile,
  ] =
    useState<CollectorProfileInput>(
      INITIAL_COLLECTOR_PROFILE,
    )

  const [
    walletProvider,
    setWalletProvider,
  ] =
    useState<CheckoutWalletProvider>(
      'metamask',
    )

  const [
    selectedWalletId,
    setSelectedWalletId,
  ] =
    useState('')

  const [
    walletConnectionStatus,
    setWalletConnectionStatus,
  ] =
    useState<WalletConnectionStatus>(
      'disconnected',
    )

  const [
    submitError,
    setSubmitError,
  ] =
    useState<string | null>(
      null,
    )

  const hasRequestedQuote =
    useRef(false)

  const hasInitializedNetwork =
    useRef(false)

  const hasInitializedWallet =
    useRef(false)

  const idempotencyKeyRef =
    useRef<string | null>(
      null,
    )

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

    hasRequestedQuote.current =
      true

    createQuote({
      items: items.map(
        (item) => ({
          nftId:
            item.nftId,

          quantity:
            item.quantity,

          version:
            item.version,
        }),
      ),

      couponCode:
        couponCode ??
        undefined,
    })
  }, [
    couponCode,
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

    hasInitializedNetwork.current =
      true

    setProfile(
      (
        currentProfile,
      ) => ({
        ...currentProfile,

        network:
          quote.network,
      }),
    )
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

    if (
      !preferredWallet
    ) {
      return
    }

    hasInitializedWallet.current =
      true

    setSelectedWalletId(
      preferredWallet.id,
    )

    setProfile(
      (
        currentProfile,
      ) => ({
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
    walletId: string | null,
  ) {
    if (walletId === null) {
      return
    }

    setSelectedWalletId(
      walletId,
    )

    setWalletConnectionStatus(
      'disconnected',
    )

    const wallet =
      wallets.find(
        (
          candidate,
        ) =>
          candidate.id ===
          walletId,
      )

    if (!wallet) {
      return
    }

    setProfile(
      (
        currentProfile,
      ) => ({
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
    if (
      !selectedWallet
    ) {
      setSubmitError(
        'Selecione uma carteira cadastrada antes de conectar.',
      )

      return
    }

    setWalletConnectionStatus(
      'connected',
    )

    setSubmitError(
      null,
    )
  }

  function handleRefuseWalletConnection() {
    if (
      !selectedWallet
    ) {
      setSubmitError(
        'Selecione uma carteira antes de simular a recusa.',
      )

      return
    }

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

    setSubmitError(
      null,
    )
  }

  function handleRetryQuote() {
    resetQuote()

    setSubmitError(
      null,
    )

    idempotencyKeyRef.current =
      null

    createQuote({
      items: items.map(
        (item) => ({
          nftId:
            item.nftId,

          quantity:
            item.quantity,

          version:
            item.version,
        }),
      ),

      couponCode:
        couponCode ??
        undefined,
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

    if (
      !isProfileValid(
        profile,
      )
    ) {
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
        `A rede selecionada deve ser ${formatNetwork(
          quote.network,
        )}.`,
      )

      return
    }

    setSubmitError(
      null,
    )

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
        onSuccess: (
          order,
        ) => {
          setSubmitError(
            null,
          )

          clearCart()

          void navigate({
            to: '/orders/$orderId',

            params: {
              orderId:
                order.id,
            },
          })
        },

        onError: (
          error,
        ) => {
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
    <div
      className="
        min-h-screen
        bg-background
      "
    >
      <Header />

      <main>
        <PageContainer
          className="
            pt-5
          "
        >
          <nav
            aria-label="Breadcrumb"
            className="
              flex
              items-center
              gap-1.75
              text-xs
              leading-4
              text-[var(--color-text-secondary)]
            "
          >
            <Link
              to="/"
              className="
                transition-colors
                hover:text-[var(--color-text-accent)]
              "
            >
              Início
            </Link>

            <ChevronRight
              size={12}
              strokeWidth={1.7}
              aria-hidden="true"
            />

            <Link
              to="/"
              hash="catalog"
              className="
                transition-colors
                hover:text-[var(--color-text-accent)]
              "
            >
              Mercado
            </Link>

            <ChevronRight
              size={12}
              strokeWidth={1.7}
              aria-hidden="true"
            />

            <span
              className="
                text-[var(--color-foreground-kurio)]
              "
            >
              Pagamento
            </span>
          </nav>
        </PageContainer>

        <PageContainer
          className="
            pb-18
            pt-8.5
          "
        >
          {isEmpty && (
            <div
              className="
                flex
                min-h-85
                flex-col
                items-center
                justify-center
                rounded-xl
                border
                border-[var(--color-border-kurio)]
                bg-[var(--color-surface-card)]
                px-7
                text-center
              "
            >
              <div
                className="
                  flex
                  h-13.5
                  w-13.5
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--color-ink)]
                  text-[var(--color-text-accent)]
                "
              >
                <Wallet
                  size={23}
                  strokeWidth={1.8}
                />
              </div>

              <h1
                className="
                  mt-4.5
                  text-xl
                  font-bold
                  leading-[26px]
                  text-[var(--color-foreground-kurio)]
                "
              >
                Seu carrinho está vazio
              </h1>

              <p
                className="
                  mt-2
                  max-w-105
                  text-[13px]
                  leading-[21px]
                  text-[var(--color-text-secondary)]
                "
              >
                Adicione NFTs ao carrinho
                antes de iniciar o pagamento.
              </p>

              <Link
                to="/"
                hash="catalog"
                className="
                  mt-5.5
                  flex
                  h-10
                  items-center
                  justify-center
                  rounded-md
                  bg-[var(--color-primary-kurio)]
                  px-5.5
                  text-xs
                  font-bold
                  text-[var(--color-ink)]
                  transition-opacity
                  hover:opacity-90
                "
              >
                EXPLORAR NFTs
              </Link>
            </div>
          )}

          {!isEmpty &&
            isQuotePending && (
              <CheckoutSkeleton />
            )}

          {!isEmpty &&
            isQuoteError && (
              <div
                role="alert"
                className="
                  flex
                  min-h-77.5
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-destructive/40
                  bg-[var(--color-surface-card)]
                  px-7
                  text-center
                "
              >
                <div
                  className="
                    flex
                    h-12.5
                    w-12.5
                    items-center
                    justify-center
                    rounded-full
                    bg-destructive/10
                    text-destructive
                  "
                >
                  <CircleAlert
                    size={22}
                    strokeWidth={1.8}
                  />
                </div>

                <h1
                  className="
                    mt-4
                    text-[19px]
                    font-bold
                    leading-[25px]
                    text-[var(--color-foreground-kurio)]
                  "
                >
                  Não foi possível validar
                  o carrinho
                </h1>

                <p
                  className="
                    mt-2
                    max-w-112.5
                    text-xs
                    leading-5
                    text-[var(--color-text-secondary)]
                  "
                >
                  Um ou mais NFTs podem ter
                  sido alterados ou ficado
                  indisponíveis.
                </p>

                <div
                  className="
                    mt-5.5
                    flex
                    gap-2.5
                  "
                >
                  <button
                    type="button"
                    onClick={
                      handleRetryQuote
                    }
                    className="
                      flex
                      h-10
                      items-center
                      justify-center
                      gap-1.75
                      rounded-md
                      bg-[var(--color-primary-kurio)]
                      px-4.5
                      text-[11px]
                      font-bold
                      text-[var(--color-ink)]
                      transition-opacity
                      hover:opacity-90
                    "
                  >
                    <RefreshCw
                      size={14}
                    />

                    Tentar novamente
                  </button>

                  <Link
                    to="/cart"
                    className="
                      flex
                      h-10
                      items-center
                      justify-center
                      rounded-md
                      border
                      border-[var(--color-border-kurio)]
                      px-4.5
                      text-[11px]
                      font-medium
                      text-[var(--color-foreground-kurio)]
                      transition-colors
                      hover:border-[var(--color-primary-kurio)]
                      hover:text-[var(--color-text-accent)]
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
                <div
                  className="
                    grid
                    grid-cols-[minmax(0,1fr)_320px]
                    items-start
                    gap-12
                  "
                >
                  <div
                    className="
                      min-w-0
                    "
                  >
                    <h1
                      className="
                        text-[28px]
                        font-bold
                        leading-[34px]
                        tracking-[-0.02em]
                        text-[var(--color-foreground-kurio)]
                      "
                    >
                      Perfil do colecionador
                    </h1>

                    <p
                      className="
                        mt-1.75
                        text-[13px]
                        leading-5
                        text-[var(--color-text-secondary)]
                      "
                    >
                      Preencha os dados
                      necessários para concluir
                      sua compra.
                    </p>

                    <div
                      className="
                        mt-6.5
                      "
                    >
                      <CollectorProfileForm
                        value={
                          profile
                        }
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

                  <aside
                    className="
                      min-w-0
                    "
                  >
                    <h2
                      className="
                        text-base
                        font-bold
                        leading-[22px]
                        text-[var(--color-foreground-kurio)]
                      "
                    >
                      Seus NFTs
                    </h2>

                    <div
                      className="
                        mt-3.25
                        flex
                        items-center
                        justify-between
                        border-b
                        border-[var(--color-border-kurio)]
                        pb-2
                        text-[10px]
                        leading-[15px]
                        text-[var(--color-text-secondary)]
                      "
                    >
                      <span>
                        NFTs
                      </span>

                      <span>
                        Subtotal
                      </span>
                    </div>

                    <div
                      className="
                        mt-2
                        space-y-[8px]
                      "
                    >
                      {quote.items.map(
                        (
                          item,
                        ) => (
                          <div
                            key={
                              item.nftId
                            }
                            className="
                              flex
                              min-h-16.5
                              items-center
                              gap-2.5
                              rounded-md
                              bg-[var(--color-surface-card)]
                              px-2
                              py-1.75
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
                                h-13
                                w-13
                                shrink-0
                                rounded-[5px]
                                object-cover
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
                                  font-bold
                                  leading-[17px]
                                  text-[var(--color-foreground-kurio)]
                                "
                              >
                                {
                                  item.name
                                }
                              </p>

                              <p
                                className="
                                  mt-0.5
                                  truncate
                                  text-[10px]
                                  leading-[15px]
                                  text-[var(--color-text-secondary)]
                                "
                              >
                                {
                                  item.tokenId
                                }{' '}
                                · Qtd.{' '}
                                {
                                  item.quantity
                                }
                              </p>
                            </div>

                            <span
                              className="
                                shrink-0
                                text-[11px]
                                font-bold
                                leading-4
                                text-[var(--color-text-accent)]
                              "
                            >
                              {
                                item.subtotalEth
                              }{' '}
                              ETH
                            </span>
                          </div>
                        ),
                      )}
                    </div>

                    {couponCode && (
                      <div
                        className="
                          mt-3.25
                          flex
                          items-center
                          justify-between
                          rounded-[5px]
                          border
                          border-[var(--color-primary-kurio)]/35
                          bg-[var(--color-primary-kurio)]/8
                          px-2.5
                          py-2
                        "
                      >
                        <div>
                          <p
                            className="
                              text-[9px]
                              uppercase
                              leading-[13px]
                              text-[var(--color-text-secondary)]
                            "
                          >
                            Cupom aplicado
                          </p>

                          <p
                            className="
                              mt-0.25
                              text-[11px]
                              font-bold
                              leading-4
                              text-[var(--color-text-accent)]
                            "
                          >
                            {
                              couponCode
                            }
                          </p>
                        </div>

                        <span
                          className="
                            rounded-sm
                            bg-[var(--color-primary-kurio)]
                            px-1.5
                            py-0.5
                            text-[8px]
                            font-bold
                            leading-[12px]
                            text-[var(--color-ink)]
                          "
                        >
                          APLICADO
                        </span>
                      </div>
                    )}

                    <div
                      className="
                        mt-4
                        space-y-[10px]
                        text-[11px]
                        leading-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
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
                          {
                            quote.subtotalEth
                          }{' '}
                          ETH
                        </span>
                      </div>

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
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
                          className={`
                            font-medium
                            ${
                              Number(
                                quote.discountEth,
                              ) >
                              0
                                ? 'text-[var(--color-text-accent)]'
                                : 'text-[var(--color-foreground-kurio)]'
                            }
                          `}
                        >
                          (-){' '}
                          {
                            quote.discountEth
                          }{' '}
                          ETH
                        </span>
                      </div>

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
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
                          {
                            quote.networkFeeEth
                          }{' '}
                          ETH
                        </span>
                      </div>

                      <p
                        className="
                          text-right
                          text-[9px]
                          leading-[13px]
                          text-[var(--color-text-accent)]
                        "
                      >
                        Taxa estimada
                      </p>
                    </div>

                    <div
                      className="
                        mt-3.5
                        flex
                        items-center
                        justify-between
                        border-t
                        border-[var(--color-border-kurio)]
                        pt-3.25
                      "
                    >
                      <span
                        className="
                          text-[13px]
                          font-bold
                          text-[var(--color-foreground-kurio)]
                        "
                      >
                        Total
                      </span>

                      <span
                        className="
                          text-[15px]
                          font-bold
                          text-[var(--color-text-accent)]
                        "
                      >
                        {
                          quote.totalEth
                        }{' '}
                        ETH
                      </span>
                    </div>

                    <div
                      className="
                        mt-5.75
                      "
                    >
                      <h3
                        className="
                          text-sm
                          font-bold
                          leading-[19px]
                          text-[var(--color-foreground-kurio)]
                        "
                      >
                        Carteira e rede
                      </h3>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          leading-4
                          text-[var(--color-text-secondary)]
                        "
                      >
                        Selecione uma carteira
                        cadastrada compatível com{' '}
                        {formatNetwork(
                          quote.network,
                        )}
                        .
                      </p>

                      <div
                        className="
                          mt-2.5
                        "
                      >
                        <Select
                          value={
                            selectedWalletId
                          }
                          onValueChange={
                            handleWalletSelection
                          }
                          disabled={
                            isWalletsPending ||
                            isOrderPending
                          }
                        >
                          <SelectTrigger
                            className="
                              h-10
                              w-full
                              rounded-md
                              border-[var(--color-border-kurio)]
                              bg-transparent
                              px-2.75
                              text-[11px]
                              text-[var(--color-foreground-kurio)]
                              shadow-none
                              focus-visible:border-[var(--color-primary-kurio)]
                              focus-visible:ring-[var(--color-primary-kurio)]/15
                            "
                          >
                            <SelectValue
                              placeholder={
                                isWalletsPending
                                  ? 'Carregando carteiras...'
                                  : compatibleWallets.length >
                                      0
                                    ? 'Selecione uma carteira'
                                    : 'Nenhuma carteira compatível'
                              }
                            />
                          </SelectTrigger>

                          <SelectContent
                            className="
                              border-[var(--color-border-kurio)]
                              bg-[var(--color-surface-card)]
                              text-[var(--color-foreground-kurio)]
                            "
                          >
                            {compatibleWallets.map(
                              (
                                wallet,
                              ) => (
                                <SelectItem
                                  key={
                                    wallet.id
                                  }
                                  value={
                                    wallet.id
                                  }
                                  className="
                                    text-[11px]
                                  "
                                >
                                  {
                                    wallet.nickname
                                  }{' '}
                                  ·{' '}
                                  {formatNetwork(
                                    wallet.network,
                                  )}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedWallet ? (
                        <div
                          className="
                            mt-2.25
                            rounded-md
                            border
                            border-[var(--color-border-kurio)]
                            bg-[var(--color-surface-card)]
                            px-2.75
                            py-2.5
                          "
                        >
                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-2.5
                            "
                          >
                            <div
                              className="
                                flex
                                min-w-0
                                items-start
                                gap-2.25
                              "
                            >
                              <div
                                className="
                                  flex
                                  h-7.5
                                  w-7.5
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-[var(--color-primary-kurio)]/12
                                  text-[var(--color-text-accent)]
                                "
                              >
                                <Wallet
                                  size={15}
                                  strokeWidth={1.8}
                                />
                              </div>

                              <div
                                className="
                                  min-w-0
                                "
                              >
                                <p
                                  className="
                                    truncate
                                    text-[11px]
                                    font-bold
                                    leading-4
                                    text-[var(--color-foreground-kurio)]
                                  "
                                >
                                  {
                                    selectedWallet.nickname
                                  }
                                </p>

                                <p
                                  className="
                                    mt-0.5
                                    text-[9px]
                                    leading-[14px]
                                    text-[var(--color-text-secondary)]
                                  "
                                >
                                  {formatWalletProvider(
                                    selectedWallet.provider,
                                  )}{' '}
                                  ·{' '}
                                  {formatNetwork(
                                    selectedWallet.network,
                                  )}
                                </p>

                                <p
                                  className="
                                    mt-0.25
                                    truncate
                                    font-mono
                                    text-[9px]
                                    leading-[14px]
                                    text-[var(--color-text-secondary)]
                                  "
                                >
                                  {formatWalletAddress(
                                    selectedWallet.address,
                                  )}
                                </p>
                              </div>
                            </div>

                            <span
                              aria-live="polite"
                              className={`
                                shrink-0
                                rounded-sm
                                px-1.5
                                py-0.75
                                text-[8px]
                                font-bold
                                uppercase
                                leading-[11px]
                                ${
                                  walletConnectionStatus ===
                                  'connected'
                                    ? `
                                        bg-[var(--color-primary-kurio)]/15
                                        text-[var(--color-text-accent)]
                                      `
                                    : walletConnectionStatus ===
                                        'refused'
                                      ? `
                                          bg-destructive/10
                                          text-destructive
                                        `
                                      : `
                                          bg-[var(--color-ink)]
                                          text-[var(--color-text-secondary)]
                                        `
                                }
                              `}
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

                          <div
                            className="
                              mt-2.5
                              flex
                              gap-1.75
                            "
                          >
                            {walletConnectionStatus !==
                            'connected' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={
                                    handleConnectWallet
                                  }
                                  disabled={
                                    isOrderPending
                                  }
                                  className="
                                    flex
                                    h-8.5
                                    flex-1
                                    items-center
                                    justify-center
                                    gap-1.5
                                    rounded-[5px]
                                    bg-[var(--color-primary-kurio)]
                                    px-2.5
                                    text-[10px]
                                    font-bold
                                    text-[var(--color-ink)]
                                    transition-opacity
                                    hover:opacity-90
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                >
                                  <Check
                                    size={13}
                                    strokeWidth={2}
                                  />

                                  Conectar
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    handleRefuseWalletConnection
                                  }
                                  disabled={
                                    isOrderPending
                                  }
                                  className="
                                    h-8.5
                                    rounded-[5px]
                                    border
                                    border-[var(--color-border-kurio)]
                                    px-2.5
                                    text-[9px]
                                    font-medium
                                    text-[var(--color-text-secondary)]
                                    transition-colors
                                    hover:border-[var(--color-primary-kurio)]
                                    hover:text-[var(--color-text-accent)]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
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
                                className="
                                  h-8.5
                                  w-full
                                  rounded-[5px]
                                  border
                                  border-[var(--color-border-kurio)]
                                  text-[10px]
                                  font-medium
                                  text-[var(--color-foreground-kurio)]
                                  transition-colors
                                  hover:border-[var(--color-primary-kurio)]
                                  hover:text-[var(--color-text-accent)]
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                "
                              >
                                Desconectar carteira
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        !isWalletsPending && (
                          <div
                            className="
                              mt-2.25
                              rounded-md
                              border
                              border-[var(--color-border-kurio)]
                              bg-[var(--color-surface-card)]
                              px-2.75
                              py-2.5
                            "
                          >
                            <p
                              className="
                                text-[10px]
                                leading-4
                                text-[var(--color-text-secondary)]
                              "
                            >
                              Nenhuma carteira
                              cadastrada é compatível
                              com a rede{' '}
                              <strong
                                className="
                                  font-bold
                                  text-[var(--color-foreground-kurio)]
                                "
                              >
                                {formatNetwork(
                                  quote.network,
                                )}
                              </strong>
                              .
                            </p>
                          </div>
                        )
                      )}
                    </div>

                    {submitError && (
                      <div
                        role="alert"
                        className="
                          mt-3
                          flex
                          items-start
                          gap-1.75
                          rounded-[5px]
                          border
                          border-destructive/30
                          bg-destructive/5
                          px-2.25
                          py-2
                        "
                      >
                        <CircleAlert
                          size={13}
                          className="
                            mt-0.25
                            shrink-0
                            text-destructive
                          "
                        />

                        <p
                          className="
                            text-[10px]
                            leading-[15px]
                            text-destructive
                          "
                        >
                          {
                            submitError
                          }
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={
                        handleConfirmPurchase
                      }
                      disabled={
                        isOrderPending ||
                        !selectedWallet ||
                        walletConnectionStatus !==
                          'connected'
                      }
                      className="
                        mt-3.5
                        flex
                        h-10
                        w-full
                        items-center
                        justify-center
                        gap-1.75
                        rounded-md
                        bg-[var(--color-primary-kurio)]
                        text-[11px]
                        font-bold
                        text-[var(--color-ink)]
                        transition-opacity
                        hover:opacity-90
                        disabled:cursor-not-allowed
                        disabled:opacity-45
                      "
                    >
                      {isOrderPending ? (
                        <>
                          <LoaderCircle
                            size={14}
                            className="
                              animate-spin
                            "
                          />

                          Confirmando compra...
                        </>
                      ) : walletConnectionStatus !==
                        'connected' ? (
                        'Conecte a carteira'
                      ) : (
                        'Confirmar compra'
                      )}
                    </button>
                  </aside>
                </div>
              </section>
            )}
        </PageContainer>

        {!isEmpty &&
          quote && (
            <div
              className="
                pb-18
              "
            >
              <BenefitsSection />
            </div>
          )}
      </main>

      <Footer />
    </div>
  )
}