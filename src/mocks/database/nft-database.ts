import type { Nft } from '@/features/nft/types/nft'
import { nftFixtures } from '@/mocks/fixtures/nfts'

const NFT_DATABASE_STORAGE_KEY =
  'kurio:mock:nfts'

export type NftPurchaseItem = {
  nftId: string
  quantity: number
  expectedVersion: number
  expectedPriceEth: string
}

export type NftPurchaseFailure =
  | {
      ok: false
      code: 'NFT_NOT_FOUND'
      nftId: string
    }
  | {
      ok: false
      code: 'INSUFFICIENT_STOCK'
      nftId: string
      requestedQuantity: number
      availableQuantity: number
    }
  | {
      ok: false
      code: 'NFT_CHANGED'
      nftId: string
      expectedVersion: number
      currentVersion: number
    }
  | {
      ok: false
      code: 'NFT_PRICE_CHANGED'
      nftId: string
      expectedPriceEth: string
      currentPriceEth: string
    }

export type NftPurchaseSuccess = {
  ok: true
  updatedNfts: Nft[]
}

export type NftPurchaseResult =
  | NftPurchaseSuccess
  | NftPurchaseFailure

function createInitialNfts() {
  return structuredClone(nftFixtures)
}

function loadNftDatabase() {
  if (
    typeof window === 'undefined'
  ) {
    return createInitialNfts()
  }

  try {
    const storedNfts =
      window.localStorage.getItem(
        NFT_DATABASE_STORAGE_KEY,
      )

    if (!storedNfts) {
      return createInitialNfts()
    }

    const parsed =
      JSON.parse(storedNfts) as Nft[]

    if (!Array.isArray(parsed)) {
      return createInitialNfts()
    }

    return parsed
  } catch {
    return createInitialNfts()
  }
}

let nftDatabase: Nft[] =
  loadNftDatabase()

function persistNftDatabase() {
  if (
    typeof window === 'undefined'
  ) {
    return
  }

  window.localStorage.setItem(
    NFT_DATABASE_STORAGE_KEY,
    JSON.stringify(
      nftDatabase,
    ),
  )
}

export function getNfts() {
  return nftDatabase
}

export function getNftById(
  nftId: string,
) {
  return nftDatabase.find(
    (nft) => nft.id === nftId,
  )
}

export function updateNft(
  nftId: string,
  updates: Partial<Nft>,
) {
  const nftIndex =
    nftDatabase.findIndex(
      (nft) => nft.id === nftId,
    )

  if (nftIndex === -1) {
    return undefined
  }

  const currentNft =
    nftDatabase[nftIndex]

  const updatedNft: Nft = {
    ...currentNft,
    ...updates,
  }

  nftDatabase[nftIndex] =
    updatedNft

  persistNftDatabase()

  return updatedNft
}

export function commitNftPurchase(
  purchaseItems: NftPurchaseItem[],
): NftPurchaseResult {
  /*
   * Trabalhamos sobre uma cópia.
   *
   * O estado real só será substituído
   * depois que TODOS os itens forem
   * validados e atualizados.
   */
  const nextDatabase =
    structuredClone(nftDatabase)

  /*
   * Agrupa itens repetidos do mesmo NFT.
   *
   * Mesmo que o carrinho normalmente
   * mantenha uma única entrada por NFT,
   * o banco mock não deve depender disso.
   */
  const aggregatedItems =
    new Map<string, NftPurchaseItem>()

  for (
    const item of purchaseItems
  ) {
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      return {
        ok: false,
        code: 'INSUFFICIENT_STOCK',
        nftId: item.nftId,
        requestedQuantity:
          item.quantity,
        availableQuantity: 0,
      }
    }

    const existingItem =
      aggregatedItems.get(
        item.nftId,
      )

    if (!existingItem) {
      aggregatedItems.set(
        item.nftId,
        {
          ...item,
        },
      )

      continue
    }

    /*
     * Duas entradas do mesmo NFT precisam
     * representar o mesmo snapshot.
     */
    if (
      existingItem.expectedVersion !==
      item.expectedVersion
    ) {
      return {
        ok: false,
        code: 'NFT_CHANGED',
        nftId: item.nftId,
        expectedVersion:
          existingItem.expectedVersion,
        currentVersion:
          item.expectedVersion,
      }
    }

    if (
      existingItem.expectedPriceEth !==
      item.expectedPriceEth
    ) {
      return {
        ok: false,
        code: 'NFT_PRICE_CHANGED',
        nftId: item.nftId,
        expectedPriceEth:
          existingItem.expectedPriceEth,
        currentPriceEth:
          item.expectedPriceEth,
      }
    }

    aggregatedItems.set(
      item.nftId,
      {
        ...existingItem,
        quantity:
          existingItem.quantity +
          item.quantity,
      },
    )
  }

  const updatedNfts: Nft[] =
    []

  /*
   * VALIDAÇÃO + ALTERAÇÃO DA CÓPIA
   */
  for (
    const item of
      aggregatedItems.values()
  ) {
    const nftIndex =
      nextDatabase.findIndex(
        (nft) =>
          nft.id === item.nftId,
      )

    if (nftIndex === -1) {
      return {
        ok: false,
        code: 'NFT_NOT_FOUND',
        nftId: item.nftId,
      }
    }

    const nft =
      nextDatabase[nftIndex]

    if (
      item.quantity >
      nft.availableQuantity
    ) {
      return {
        ok: false,
        code:
          'INSUFFICIENT_STOCK',
        nftId: nft.id,
        requestedQuantity:
          item.quantity,
        availableQuantity:
          nft.availableQuantity,
      }
    }

    if (
      item.expectedVersion !==
      nft.version
    ) {
      return {
        ok: false,
        code: 'NFT_CHANGED',
        nftId: nft.id,
        expectedVersion:
          item.expectedVersion,
        currentVersion:
          nft.version,
      }
    }

    if (
      item.expectedPriceEth !==
      nft.priceEth
    ) {
      return {
        ok: false,
        code:
          'NFT_PRICE_CHANGED',
        nftId: nft.id,
        expectedPriceEth:
          item.expectedPriceEth,
        currentPriceEth:
          nft.priceEth,
      }
    }

    const updatedNft: Nft = {
      ...nft,

      availableQuantity:
        nft.availableQuantity -
        item.quantity,

      version:
        nft.version + 1,
    }

    nextDatabase[nftIndex] =
      updatedNft

    updatedNfts.push(
      updatedNft,
    )
  }

  /*
   * COMMIT
   *
   * Nada do estado real foi alterado
   * antes deste ponto.
   */
  nftDatabase =
    nextDatabase

  persistNftDatabase()

  return {
    ok: true,
    updatedNfts,
  }
}

export function resetNftDatabase() {
  nftDatabase =
    createInitialNfts()

  persistNftDatabase()
}