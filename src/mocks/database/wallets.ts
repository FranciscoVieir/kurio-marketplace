import type {
  SaveWalletRequest,
  UserWallet,
  WalletRole,
} from '@/features/wallets/types/wallet'

const WALLETS_STORAGE_KEY =
  'kurio:mock:wallets'

function loadWallets() {
  if (
    typeof window ===
    'undefined'
  ) {
    return new Map<
      string,
      UserWallet
    >()
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        WALLETS_STORAGE_KEY,
      )

    if (!storedValue) {
      return new Map<
        string,
        UserWallet
      >()
    }

    const parsed =
      JSON.parse(
        storedValue,
      ) as Array<
        [
          string,
          UserWallet,
        ]
      >

    return new Map<
      string,
      UserWallet
    >(
      parsed,
    )
  } catch {
    return new Map<
      string,
      UserWallet
    >()
  }
}

const wallets =
  loadWallets()

function persistWallets() {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.setItem(
    WALLETS_STORAGE_KEY,
    JSON.stringify(
      Array.from(
        wallets.entries(),
      ),
    ),
  )
}

export function getWallet(
  walletId: string,
) {
  return wallets.get(
    walletId,
  )
}

export function getWalletForUser(
  walletId: string,
  userId: string,
) {
  const wallet =
    wallets.get(
      walletId,
    )

  if (
    !wallet ||
    wallet.userId !==
      userId
  ) {
    return undefined
  }

  return wallet
}

export function getWalletsByUserId(
  userId: string,
) {
  return Array.from(
    wallets.values(),
  )
    .filter(
      (wallet) =>
        wallet.userId ===
        userId,
    )
    .sort(
      (
        firstWallet,
        secondWallet,
      ) => {
        if (
          firstWallet.role ===
          secondWallet.role
        ) {
          return (
            new Date(
              firstWallet.createdAt,
            ).getTime() -
            new Date(
              secondWallet.createdAt,
            ).getTime()
          )
        }

        return firstWallet.role ===
          'primary'
          ? -1
          : 1
      },
    )
}

export function getWalletByRole(
  userId: string,
  role: WalletRole,
) {
  return Array.from(
    wallets.values(),
  ).find(
    (wallet) =>
      wallet.userId ===
        userId &&
      wallet.role === role,
  )
}

export function createWallet(
  userId: string,
  input: SaveWalletRequest,
) {
  const now =
    new Date().toISOString()

  const wallet: UserWallet = {
    id:
      `wallet_${crypto.randomUUID()}`,

    userId,

    ...input,

    createdAt:
      now,

    updatedAt:
      now,
  }

  wallets.set(
    wallet.id,
    wallet,
  )

  persistWallets()

  return wallet
}

export function updateWallet(
  walletId: string,
  userId: string,
  input: SaveWalletRequest,
) {
  const currentWallet =
    getWalletForUser(
      walletId,
      userId,
    )

  if (!currentWallet) {
    return undefined
  }

  const updatedWallet: UserWallet = {
    ...currentWallet,

    ...input,

    id:
      currentWallet.id,

    userId:
      currentWallet.userId,

    createdAt:
      currentWallet.createdAt,

    updatedAt:
      new Date().toISOString(),
  }

  wallets.set(
    walletId,
    updatedWallet,
  )

  persistWallets()

  return updatedWallet
}

export function deleteWallet(
  walletId: string,
  userId: string,
) {
  const wallet =
    getWalletForUser(
      walletId,
      userId,
    )

  if (!wallet) {
    return false
  }

  wallets.delete(
    walletId,
  )

  persistWallets()

  return true
}

export function clearWallets() {
  wallets.clear()

  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.removeItem(
    WALLETS_STORAGE_KEY,
  )
}