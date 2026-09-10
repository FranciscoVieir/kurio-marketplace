import type { Order } from '@/features/checkout/types/checkout'

import type { Nft } from '@/features/nft/types/nft'

export type NftUpdatedEvent = {
  nft: Nft
}

export type OrderUpdatedEvent = {
  order: Order
}

export type ServerToClientEvents = {
  'nft.updated': (
    event: NftUpdatedEvent,
  ) => void

  'order.updated': (
    event: OrderUpdatedEvent,
  ) => void
}

export type ClientToServerEvents = {
  'session.bind': (
    userId: string,
  ) => void
}