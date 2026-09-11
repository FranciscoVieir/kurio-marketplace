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
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  EllipsisVertical,
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
import {
  useSaveWallet,
  useWallets,
} from '@/features/wallets/hooks/use-wallets'

import type {
  SaveWalletRequest,
} from '@/features/wallets/types/wallet'

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

const CREATE_NEW_WALLET_VALUE =
  '__create_new_wallet__'

const MOBILE_WALLET_PROVIDERS = [
  {
    id: 'walletconnect',
    label: 'WalletConnect',
    initial: 'W',
  },
  {
    id: 'metamask',
    label: 'MetaMask',
    initial: 'M',
  },
  {
    id: 'coinbase',
    label: 'Coinbase Wallet',
    initial: 'C',
  },
] as const

type MobileWalletProvider =
  (typeof MOBILE_WALLET_PROVIDERS)[number]['id']

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


function getWalletErrorMessage(
  error: unknown,
) {
  if (
    axios.isAxiosError<{
      message?: string
    }>(error)
  ) {
    return (
      error.response?.data
        ?.message ??
      'Não foi possível salvar a carteira.'
    )
  }

  return 'Não foi possível salvar a carteira.'
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

  const saveWallet =
    useSaveWallet()

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

  const mobileWalletSectionRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  const idempotencyKeyRef =
    useRef<string | null>(
      null,
    )

  /*
   * A quote representa o snapshot validado
   * pelo backend no início do checkout.
   *
   * Eventos nft.updated atualizam o snapshot
   * mantido pelo carrinho. Se preço, estoque,
   * quantidade ou versão deixarem de coincidir,
   * a quote antiga não pode mais ser confirmada.
   *
   * Depois que uma tentativa de pedido já começou,
   * mantemos a mesma quote/chave de idempotência.
   * Isso é necessário para recuperar corretamente
   * o mesmo pedido após timeout, sem criar outro.
   */
  const changedQuoteItems =
    quote
      ? items.filter(
          (item) => {
            const quotedItem =
              quote.items.find(
                (
                  candidate,
                ) =>
                  candidate.nftId ===
                  item.nftId,
              )

            if (!quotedItem) {
              return true
            }

            return (
              quotedItem.quantity !==
                item.quantity ||
              quotedItem.version !==
                item.version ||
              quotedItem.unitPriceEth !==
                item.priceEth ||
              quotedItem.availableQuantity !==
                item.availableQuantity
            )
          },
        )
      : []

  const quoteNeedsRevalidation =
    Boolean(
      quote &&
        (
          quote.items.length !==
            items.length ||
          changedQuoteItems.length >
            0
        ) &&
        !idempotencyKeyRef.current,
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

  const isCreatingWallet =
    selectedWalletId ===
      CREATE_NEW_WALLET_VALUE ||
    (!isWalletsPending &&
      wallets.length === 0)

  const hasPrimaryWallet =
    wallets.some(
      (wallet) =>
        wallet.role ===
        'primary',
    )

  const hasSecondaryWallet =
    wallets.some(
      (wallet) =>
        wallet.role ===
        'secondary',
    )

  const canCreateWallet =
    Boolean(
      quote &&
        isCreatingWallet &&
        isProfileValid(
          profile,
        ) &&
        !(
          hasPrimaryWallet &&
          hasSecondaryWallet
        ),
    )

  const mobileWallets =
    [...wallets].sort(
      (
        firstWallet,
        secondWallet,
      ) => {
        const firstOrder =
          firstWallet.role ===
          'primary'
            ? 1
            : 0

        const secondOrder =
          secondWallet.role ===
          'primary'
            ? 1
            : 0

        return (
          firstOrder -
          secondOrder
        )
      },
    )

  const selectedMobileProvider =
    String(
      selectedWallet?.provider ??
        walletProvider,
    ).toLowerCase()

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

  useEffect(() => {
    if (
      !selectedWallet ||
      typeof window ===
        'undefined' ||
      !window.matchMedia(
        '(max-width: 767px)',
      ).matches
    ) {
      return
    }

    setWalletConnectionStatus(
      (
        currentStatus,
      ) =>
        currentStatus ===
        'refused'
          ? currentStatus
          : 'connected',
    )
  }, [selectedWallet])

  function handleWalletSelection(
    walletId: string | null,
  ) {
    if (walletId === null) {
      return
    }

    setWalletConnectionStatus(
      'disconnected',
    )

    if (
      walletId ===
      CREATE_NEW_WALLET_VALUE
    ) {
      hasInitializedWallet.current =
        true

      setSelectedWalletId(
        CREATE_NEW_WALLET_VALUE,
      )

      setProfile({
        ...INITIAL_COLLECTOR_PROFILE,
      })

      setWalletProvider(
        'metamask',
      )

      setSubmitError(
        null,
      )

      idempotencyKeyRef.current =
        null

      return
    }

    setSelectedWalletId(
      walletId,
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

  async function handleConnectWallet() {
    if (
      selectedWallet
    ) {
      if (
        quote &&
        selectedWallet.network !==
          quote.network
      ) {
        setSubmitError(
          `A carteira selecionada utiliza ${formatNetwork(
            selectedWallet.network,
          )}. Para esta compra, conecte uma carteira da rede ${formatNetwork(
            quote.network,
          )}.`,
        )

        return
      }

      setWalletConnectionStatus(
        'connected',
      )

      setSubmitError(
        null,
      )

      return
    }

    if (!quote) {
      return
    }

    if (
      !isProfileValid(
        profile,
      )
    ) {
      setSubmitError(
        'Preencha todos os campos obrigatórios antes de conectar a carteira.',
      )

      return
    }

    if (
      hasPrimaryWallet &&
      hasSecondaryWallet
    ) {
      setSubmitError(
        'Você já possui uma carteira principal e uma secundária. Selecione uma carteira cadastrada para continuar.',
      )

      return
    }

    const input: SaveWalletRequest = {
      role:
        hasPrimaryWallet
          ? 'secondary'
          : 'primary',

      displayName:
        profile.displayName.trim(),

      nickname:
        profile.username.trim(),

      network:
        profile.network,

      profileName:
        profile.profileName.trim(),

      address:
        profile.walletAddress.trim(),

      secondaryAddress:
        profile.secondaryWallet?.trim() ||
        undefined,

      provider:
        profile.walletType as SaveWalletRequest['provider'],

      referralCode:
        profile.referralCode?.trim() ||
        undefined,

      email:
        profile.email.trim(),

      ensName:
        profile.ensName?.trim() ||
        undefined,
    }

    try {
      const createdWallet =
        await saveWallet.mutateAsync({
          input,
        })

      hasInitializedWallet.current =
        true

      setSelectedWalletId(
        createdWallet.id,
      )

      setProfile(
        (
          currentProfile,
        ) => ({
          ...currentProfile,

          network:
            createdWallet.network,

          walletType:
            createdWallet.provider,
        }),
      )

      if (
        isCheckoutWalletProvider(
          createdWallet.provider,
        )
      ) {
        setWalletProvider(
          createdWallet.provider,
        )
      }

      if (
        quote &&
        createdWallet.network !==
          quote.network
      ) {
        setWalletConnectionStatus(
          'disconnected',
        )

        setSubmitError(
          `Carteira cadastrada com sucesso na rede ${formatNetwork(
            createdWallet.network,
          )}. Para concluir esta compra, use uma carteira da rede ${formatNetwork(
            quote.network,
          )}.`,
        )

        return
      }

      setWalletConnectionStatus(
        'connected',
      )

      setSubmitError(
        null,
      )
    } catch (error) {
      setSubmitError(
        getWalletErrorMessage(
          error,
        ),
      )
    }
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

  function handleMobileBack() {
    void navigate({
      to: '/cart',
    })
  }

  function handleMobileChangeWallet() {
    mobileWalletSectionRef.current?.scrollIntoView(
      {
        behavior: 'smooth',
        block: 'center',
      },
    )
  }

  function handleMobileWalletSelection(
    walletId: string,
  ) {
    const wallet =
      wallets.find(
        (candidate) =>
          candidate.id ===
          walletId,
      )

    handleWalletSelection(
      walletId,
    )

    if (
      wallet &&
      quote &&
      wallet.network !==
        quote.network
    ) {
      setWalletConnectionStatus(
        'disconnected',
      )

      setSubmitError(
        `A carteira selecionada utiliza ${formatNetwork(
          wallet.network,
        )}. Para esta compra, conecte uma carteira da rede ${formatNetwork(
          quote.network,
        )}.`,
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

  function handleMobileProviderSelection(
    provider: MobileWalletProvider,
  ) {
    if (
      provider ===
      'walletconnect'
    ) {
      setSubmitError(
        'WalletConnect ainda não está habilitado para finalizar compras. Use MetaMask ou Coinbase Wallet.',
      )

      return
    }

    setWalletProvider(
      provider,
    )

    const providerWallet =
      compatibleWallets.find(
        (wallet) =>
          String(
            wallet.provider,
          ).toLowerCase() ===
          provider,
      ) ??
      wallets.find(
        (wallet) =>
          String(
            wallet.provider,
          ).toLowerCase() ===
          provider,
      )

    if (
      !providerWallet
    ) {
      setSubmitError(
        `Nenhuma carteira ${formatWalletProvider(
          provider,
        )} cadastrada.`,
      )

      return
    }

    handleMobileWalletSelection(
      providerWallet.id,
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
      quoteNeedsRevalidation
    ) {
      setSubmitError(
        'A cotação está desatualizada. Revalide preço e disponibilidade antes de confirmar a compra.',
      )

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
      <div
        className="
          max-md:hidden
        "
      >
        <Header />
      </div>

      <main>
        <PageContainer
          className="
            pt-5

            max-md:hidden
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

            max-md:px-[16px]
            max-md:pb-[36px]
            max-md:pt-[42px]
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
                {/* MOBILE */}
                <div
                  className="
                    hidden

                    max-md:mx-auto
                    max-md:flex
                    max-md:min-h-[700px]
                    max-md:w-full
                    max-md:max-w-[390px]
                    max-md:flex-col
                    max-md:rounded-[30px]
                    max-md:bg-[var(--color-ink)]
                    max-md:px-[16px]
                    max-md:pb-[24px]
                    max-md:pt-[20px]
                  "
                >
                  {/* Topo */}
                  <div
                    className="
                      grid
                      h-[44px]
                      w-full
                      grid-cols-[35px_minmax(0,1fr)_35px]
                      items-center
                    "
                  >
                    <button
                      type="button"
                      onClick={
                        handleMobileBack
                      }
                      aria-label="Voltar ao carrinho"
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
                        text-[var(--color-text-accent)]
                        transition-opacity
                        active:opacity-70
                      "
                    >
                      <ChevronLeft
                        size={16}
                        strokeWidth={1.6}
                      />
                    </button>

                    <h1
                      className="
                        min-w-0
                        truncate
                        text-center
                        text-[20px]
                        font-bold
                        leading-[16px]
                        text-[var(--color-foreground-kurio)]
                      "
                    >
                      Pagamento com carteira
                    </h1>

                    <span
                      aria-hidden="true"
                    />
                  </div>

                  {/* Carteiras cadastradas */}
                  <div
                    className="
                      mt-[16px]
                      w-full
                    "
                  >
                    <div
                      className="
                        flex
                        h-[16px]
                        w-full
                        items-center
                        justify-between
                        gap-[16px]
                      "
                    >
                      <h2
                        className="
                          text-[16px]
                          font-bold
                          leading-[16px]
                          text-[var(--color-foreground-kurio)]
                        "
                      >
                        Carteira conectada
                      </h2>

                      <button
                        type="button"
                        onClick={
                          handleMobileChangeWallet
                        }
                        className="
                          shrink-0
                          text-[14px]
                          font-bold
                          leading-[16px]
                          text-[var(--color-text-accent)]
                          transition-opacity
                          active:opacity-70
                        "
                      >
                        Trocar carteira
                      </button>
                    </div>

                    <div
                      className="
                        mt-[12px]
                        space-y-[16px]
                      "
                    >
                      {isWalletsPending ? (
                        <>
                          {Array.from({
                            length: 2,
                          }).map(
                            (
                              _,
                              index,
                            ) => (
                              <div
                                key={
                                  index
                                }
                                className="
                                  h-[93px]
                                  w-full
                                  rounded-[14px]
                                  bg-[var(--color-surface-card)]
                                  kurio-shimmer
                                "
                              />
                            ),
                          )}
                        </>
                      ) : mobileWallets.length >
                        0 ? (
                        mobileWallets.map(
                          (wallet) => {
                            const isSelected =
                              wallet.id ===
                              selectedWalletId

                            return (
                              <div
                                key={
                                  wallet.id
                                }
                                className="
                                  relative
                                  h-[93px]
                                  w-full
                                "
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMobileWalletSelection(
                                      wallet.id,
                                    )
                                  }
                                  aria-pressed={
                                    isSelected
                                  }
                                  className="
                                    grid
                                    h-[93px]
                                    w-full
                                    grid-cols-[16px_minmax(0,1fr)]
                                    items-center
                                    gap-[19px]
                                    rounded-[14px]
                                    bg-[var(--color-surface-card)]
                                    pb-[11px]
                                    pl-[19px]
                                    pr-[44px]
                                    pt-[12px]
                                    text-left
                                    transition-opacity
                                    active:opacity-85
                                  "
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`
                                      flex
                                      h-[16px]
                                      w-[16px]
                                      items-center
                                      justify-center
                                      rounded-full
                                      border-[1.2px]

                                      ${
                                        isSelected
                                          ? `
                                            border-[var(--color-primary-kurio)]
                                          `
                                          : `
                                            border-[var(--color-border-kurio)]
                                          `
                                      }
                                    `}
                                  >
                                    {isSelected && (
                                      <span
                                        className="
                                          h-[8px]
                                          w-[8px]
                                          rounded-full
                                          bg-[var(--color-primary-kurio)]
                                        "
                                      />
                                    )}
                                  </span>

                                  <span
                                    className="
                                      min-w-0
                                      self-start
                                    "
                                  >
                                    <span
                                      className="
                                        block
                                        truncate
                                        text-[16px]
                                        font-bold
                                        leading-[16px]
                                        text-[var(--color-foreground-kurio)]
                                      "
                                    >
                                      {wallet.role ===
                                      'primary'
                                        ? 'Principal'
                                        : 'Reserva'}
                                    </span>

                                    <span
                                      className="
                                        mt-[7px]
                                        block
                                        truncate
                                        text-[14px]
                                        font-normal
                                        leading-[22px]
                                        text-[var(--color-text-secondary)]
                                      "
                                    >
                                      {wallet.ensName?.trim() ||
                                        formatWalletAddress(
                                          wallet.address,
                                        )}
                                    </span>

                                    <span
                                      className="
                                        block
                                        truncate
                                        text-[14px]
                                        font-normal
                                        leading-[22px]
                                        text-[var(--color-text-secondary)]
                                      "
                                    >
                                      {wallet.role ===
                                      'primary'
                                        ? 'Rede principal '
                                        : 'Rede '}
                                      {formatNetwork(
                                        wallet.network,
                                      )}
                                    </span>
                                  </span>
                                </button>

                                <Link
                                  to="/profile/wallets"
                                  aria-label={`Editar carteira ${wallet.nickname}`}
                                  className="
                                    absolute
                                    right-[12px]
                                    top-1/2
                                    z-10
                                    flex
                                    h-[30px]
                                    w-[24px]
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    text-[var(--color-secondary,#B39463)]
                                    transition-opacity
                                    active:opacity-70
                                  "
                                >
                                  <EllipsisVertical
                                    size={17}
                                    strokeWidth={2}
                                  />
                                </Link>
                              </div>
                            )
                          },
                        )
                      ) : (
                        <div
                          className="
                            flex
                            min-h-[93px]
                            items-center
                            rounded-[14px]
                            border
                            border-[var(--color-border-kurio)]
                            bg-[var(--color-surface-card)]
                            px-[18px]
                          "
                        >
                          <p
                            className="
                              text-[13px]
                              leading-[20px]
                              text-[var(--color-text-secondary)]
                            "
                          >
                            Nenhuma carteira cadastrada.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Carteira e rede */}
                  <div
                    ref={
                      mobileWalletSectionRef
                    }
                    className="
                      mt-[14px]
                      w-full
                      scroll-mt-[20px]
                    "
                  >
                    <h2
                      className="
                        text-[16px]
                        font-bold
                        leading-[16px]
                        text-[var(--color-foreground-kurio)]
                      "
                    >
                      Carteira e rede
                    </h2>

                    <div
                      className="
                        mt-[10px]
                        space-y-[12px]
                      "
                    >
                      {MOBILE_WALLET_PROVIDERS.map(
                        (
                          provider,
                        ) => {
                          const isSelected =
                            selectedMobileProvider ===
                            provider.id

                          return (
                            <button
                              key={
                                provider.id
                              }
                              type="button"
                              onClick={() =>
                                handleMobileProviderSelection(
                                  provider.id,
                                )
                              }
                              aria-pressed={
                                isSelected
                              }
                              className="
                                flex
                                h-[52px]
                                w-full
                                items-center
                                rounded-[14px]
                                bg-[var(--color-surface-card)]
                                px-[10px]
                                text-left
                                transition-opacity
                                active:opacity-85
                              "
                            >
                              <span
                                className="
                                  flex
                                  h-[40px]
                                  w-[40px]
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  border
                                  border-[var(--color-border-kurio)]
                                  bg-[var(--color-surface-raised)]
                                  text-[13px]
                                  font-medium
                                  leading-[16px]
                                  text-[var(--color-text-accent)]
                                "
                              >
                                {
                                  provider.initial
                                }
                              </span>

                              <span
                                className="
                                  ml-[10px]
                                  min-w-0
                                  flex-1
                                  truncate
                                  text-[14px]
                                  font-normal
                                  leading-[16px]
                                  text-[var(--color-foreground-kurio)]
                                "
                              >
                                {
                                  provider.label
                                }
                              </span>

                              <span
                                aria-hidden="true"
                                className={`
                                  mr-[4px]
                                  flex
                                  h-[14px]
                                  w-[14px]
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  border

                                  ${
                                    isSelected
                                      ? `
                                        border-[var(--color-primary-kurio)]
                                      `
                                      : `
                                        border-[var(--color-border-kurio)]
                                      `
                                  }
                                `}
                              >
                                {isSelected && (
                                  <span
                                    className="
                                      h-[7px]
                                      w-[7px]
                                      rounded-full
                                      bg-[var(--color-primary-kurio)]
                                    "
                                  />
                                )}
                              </span>
                            </button>
                          )
                        },
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div
                    className="
                      mt-[14px]
                      flex
                      w-full
                      justify-end
                    "
                  >
                    <div
                      className="
                        flex
                        h-[16px]
                        w-[184px]
                        items-center
                        justify-between
                        gap-[28px]
                      "
                    >
                      <span
                        className="
                          text-[16px]
                          font-bold
                          leading-[16px]
                          text-[var(--color-foreground-kurio)]
                        "
                      >
                        Total:
                      </span>

                      <span
                        className="
                          shrink-0
                          text-right
                          text-[18px]
                          font-bold
                          leading-[16px]
                          text-[var(--color-text-accent)]
                        "
                      >
                        {
                          quote.totalEth
                        }{' '}
                        ETH
                      </span>
                    </div>
                  </div>

                  {quoteNeedsRevalidation && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="
                        mt-[14px]
                        rounded-[10px]
                        border
                        border-[var(--color-primary-kurio)]/40
                        bg-[var(--color-primary-kurio)]/8
                        px-[12px]
                        py-[11px]
                      "
                    >
                      <div
                        className="
                          flex
                          items-start
                          gap-[8px]
                        "
                      >
                        <RefreshCw
                          size={14}
                          className="
                            mt-[2px]
                            shrink-0
                            text-[var(--color-text-accent)]
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
                              text-[12px]
                              font-bold
                              leading-[17px]
                              text-[var(--color-foreground-kurio)]
                            "
                          >
                            Preço ou disponibilidade
                            atualizados
                          </p>

                          <p
                            className="
                              mt-[3px]
                              text-[11px]
                              leading-[17px]
                              text-[var(--color-text-secondary)]
                            "
                          >
                            A cotação exibida foi
                            criada antes dessa
                            alteração. Revalide para
                            atualizar o resumo antes
                            de confirmar.
                          </p>

                          {changedQuoteItems.map(
                            (item) => (
                              <p
                                key={
                                  item.nftId
                                }
                                className="
                                  mt-[5px]
                                  text-[10px]
                                  leading-[15px]
                                  text-[var(--color-text-accent)]
                                "
                              >
                                {item.name}:{' '}
                                {item.priceEth}{' '}
                                ETH ·{' '}
                                {
                                  item.availableQuantity
                                }{' '}
                                disponíveis
                              </p>
                            ),
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleRetryQuote
                        }
                        disabled={
                          isQuotePending
                        }
                        className="
                          mt-[10px]
                          flex
                          h-[36px]
                          w-full
                          items-center
                          justify-center
                          gap-[6px]
                          rounded-[18px]
                          border
                          border-[var(--color-primary-kurio)]/45
                          bg-[var(--color-primary-kurio)]
                          text-[11px]
                          font-bold
                          text-[var(--color-ink)]
                          transition-opacity
                          active:opacity-80
                          disabled:cursor-not-allowed
                          disabled:opacity-45
                        "
                      >
                        <RefreshCw
                          size={13}
                          className={
                            isQuotePending
                              ? 'animate-spin'
                              : undefined
                          }
                        />

                        Revalidar cotação
                      </button>
                    </div>
                  )}

                  {/* Erro */}
                  {submitError && (
                    <div
                      role="alert"
                      className="
                        mt-[14px]
                        flex
                        items-start
                        gap-[7px]
                        rounded-[10px]
                        border
                        border-destructive/30
                        bg-destructive/5
                        px-[12px]
                        py-[9px]
                      "
                    >
                      <CircleAlert
                        size={14}
                        className="
                          mt-[2px]
                          shrink-0
                          text-destructive
                        "
                      />

                      <p
                        className="
                          text-[11px]
                          leading-[17px]
                          text-destructive
                        "
                      >
                        {
                          submitError
                        }
                      </p>
                    </div>
                  )}

                  {/* Confirmar */}
                  <div
                    className="
                      mt-auto
                      w-full
                      pt-[24px]
                    "
                  >
                    <button
                      type="button"
                      onClick={
                        handleConfirmPurchase
                      }
                      disabled={
                        isOrderPending ||
                        isQuotePending ||
                        quoteNeedsRevalidation ||
                        !selectedWallet
                      }
                      className="
                        flex
                        h-[60px]
                        w-full
                        items-center
                        justify-center
                        gap-[8px]
                        rounded-[40px]
                        bg-[linear-gradient(93.21deg,#D28A4C_-3.96%,rgba(210,138,76,0.8)_121.97%)]
                        text-center
                        text-[16px]
                        font-bold
                        leading-[16px]
                        text-[var(--color-ink)]
                        transition-opacity
                        active:opacity-80
                        disabled:cursor-not-allowed
                        disabled:opacity-45
                      "
                    >
                      {isOrderPending ? (
                        <>
                          <LoaderCircle
                            size={16}
                            className="
                              animate-spin
                            "
                          />

                          Confirmando compra...
                        </>
                      ) : (
                        'Confirmar compra'
                      )}
                    </button>
                  </div>
                </div>

                {/* DESKTOP */}
                <div
                  className="
                    grid
                    grid-cols-[minmax(0,1fr)_320px]
                    items-start
                    gap-12

                    max-md:hidden
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

                    {quoteNeedsRevalidation && (
                      <div
                        role="status"
                        aria-live="polite"
                        className="
                          mt-3.5
                          rounded-md
                          border
                          border-[var(--color-primary-kurio)]/40
                          bg-[var(--color-primary-kurio)]/8
                          px-2.75
                          py-2.5
                        "
                      >
                        <div
                          className="
                            flex
                            items-start
                            gap-2
                          "
                        >
                          <RefreshCw
                            size={14}
                            className="
                              mt-0.5
                              shrink-0
                              text-[var(--color-text-accent)]
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
                                text-[11px]
                                font-bold
                                leading-4
                                text-[var(--color-foreground-kurio)]
                              "
                            >
                              Preço ou disponibilidade
                              atualizados
                            </p>

                            <p
                              className="
                                mt-1
                                text-[10px]
                                leading-[15px]
                                text-[var(--color-text-secondary)]
                              "
                            >
                              A cotação atual está
                              desatualizada. Revalide
                              para recalcular o resumo
                              antes de confirmar.
                            </p>

                            {changedQuoteItems.map(
                              (item) => (
                                <p
                                  key={
                                    item.nftId
                                  }
                                  className="
                                    mt-1
                                    text-[9px]
                                    leading-[14px]
                                    text-[var(--color-text-accent)]
                                  "
                                >
                                  {item.name}:{' '}
                                  {item.priceEth}{' '}
                                  ETH ·{' '}
                                  {
                                    item.availableQuantity
                                  }{' '}
                                  disponíveis
                                </p>
                              ),
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={
                            handleRetryQuote
                          }
                          disabled={
                            isQuotePending
                          }
                          className="
                            mt-2.5
                            flex
                            h-9
                            w-full
                            items-center
                            justify-center
                            gap-1.5
                            rounded-md
                            border
                            border-[var(--color-primary-kurio)]/45
                            bg-[var(--color-primary-kurio)]
                            text-[10px]
                            font-bold
                            text-[var(--color-ink)]
                            transition-opacity
                            hover:opacity-90
                            disabled:cursor-not-allowed
                            disabled:opacity-45
                          "
                        >
                          <RefreshCw
                            size={12}
                            className={
                              isQuotePending
                                ? 'animate-spin'
                                : undefined
                            }
                          />

                          Revalidar cotação
                        </button>
                      </div>
                    )}

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
                        Use uma carteira cadastrada
                        ou escolha criar uma nova. Para
                        concluir a compra, a carteira
                        precisa ser compatível com{' '}
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
                                  : wallets.length >
                                      0
                                    ? 'Selecione ou crie uma carteira'
                                    : 'Criar nova carteira'
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
                            <SelectItem
                              value={
                                CREATE_NEW_WALLET_VALUE
                              }
                              className="
                                text-[11px]
                                font-medium
                                text-[var(--color-text-accent)]
                              "
                            >
                              Criar nova carteira
                            </SelectItem>

                            {wallets.map(
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
                      ) : isCreatingWallet ? (
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
                                flex-1
                              "
                            >
                              <p
                                className="
                                  text-[11px]
                                  font-bold
                                  leading-4
                                  text-[var(--color-foreground-kurio)]
                                "
                              >
                                Nova carteira
                              </p>

                              <p
                                className="
                                  mt-0.5
                                  text-[9px]
                                  leading-[14px]
                                  text-[var(--color-text-secondary)]
                                "
                              >
                                Escolha a rede e preencha os
                                campos obrigatórios no
                                formulário ao lado.
                              </p>

                              <p
                                className="
                                  mt-0.5
                                  text-[9px]
                                  leading-[14px]
                                  text-[var(--color-text-secondary)]
                                "
                              >
                                Para usar essa carteira nesta
                                compra, ela deve ser compatível
                                com{' '}
                                {formatNetwork(
                                  quote.network,
                                )}
                                .
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              void handleConnectWallet()
                            }}
                            disabled={
                              !canCreateWallet ||
                              isOrderPending ||
                              saveWallet.isPending
                            }
                            className="
                              mt-2.5
                              flex
                              h-8.5
                              w-full
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
                            {saveWallet.isPending ? (
                              <>
                                <LoaderCircle
                                  size={13}
                                  className="animate-spin"
                                />

                                Cadastrando...
                              </>
                            ) : hasPrimaryWallet &&
                              hasSecondaryWallet ? (
                              'Limite de carteiras atingido'
                            ) : (
                              <>
                                <Check
                                  size={13}
                                  strokeWidth={2}
                                />

                                Cadastrar e conectar
                              </>
                            )}
                          </button>
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
                              Selecione uma carteira cadastrada
                              ou escolha “Criar nova carteira”.
                              Para concluir esta compra, a
                              carteira conectada precisa ser
                              compatível com{' '}
                              {formatNetwork(
                                quote.network,
                              )}
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
                        isQuotePending ||
                        quoteNeedsRevalidation ||
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
                max-md:hidden
              "
            >
              <BenefitsSection />
            </div>
          )}
      </main>

      <div
        className="
          max-md:hidden
        "
      >
        <Footer />
      </div>
    </div>
  )
}