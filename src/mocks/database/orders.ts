import type { Order } from '@/features/checkout/types/checkout'

const ORDERS_STORAGE_KEY =
  'kurio:mock:orders'

const IDEMPOTENCY_STORAGE_KEY =
  'kurio:mock:orders:idempotency'

function createIdempotencyStorageKey(
  userId: string,
  idempotencyKey: string,
) {
  return `${userId}:${idempotencyKey}`
}

function loadOrders() {
  if (
    typeof window ===
    'undefined'
  ) {
    return new Map<
      string,
      Order
    >()
  }

  try {
    const storedOrders =
      window.localStorage.getItem(
        ORDERS_STORAGE_KEY,
      )

    if (!storedOrders) {
      return new Map<
        string,
        Order
      >()
    }

    const parsed =
      JSON.parse(
        storedOrders,
      ) as Array<
        [
          string,
          Order,
        ]
      >

    return new Map<
      string,
      Order
    >(
      parsed,
    )
  } catch {
    return new Map<
      string,
      Order
    >()
  }
}

function loadOrdersByIdempotencyKey() {
  if (
    typeof window ===
    'undefined'
  ) {
    return new Map<
      string,
      Order
    >()
  }

  try {
    const storedEntries =
      window.localStorage.getItem(
        IDEMPOTENCY_STORAGE_KEY,
      )

    if (!storedEntries) {
      return new Map<
        string,
        Order
      >()
    }

    const parsed =
      JSON.parse(
        storedEntries,
      ) as Array<
        [
          string,
          Order,
        ]
      >

    return new Map<
      string,
      Order
    >(
      parsed,
    )
  } catch {
    return new Map<
      string,
      Order
    >()
  }
}

const orders =
  loadOrders()

const ordersByIdempotencyKey =
  loadOrdersByIdempotencyKey()

function persistOrders() {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.setItem(
    ORDERS_STORAGE_KEY,
    JSON.stringify(
      Array.from(
        orders.entries(),
      ),
    ),
  )

  window.localStorage.setItem(
    IDEMPOTENCY_STORAGE_KEY,
    JSON.stringify(
      Array.from(
        ordersByIdempotencyKey.entries(),
      ),
    ),
  )
}

export function saveOrder(
  order: Order,
  idempotencyKey: string,
) {
  orders.set(
    order.id,
    order,
  )

  const storageKey =
    createIdempotencyStorageKey(
      order.userId,
      idempotencyKey,
    )

  ordersByIdempotencyKey.set(
    storageKey,
    order,
  )

  persistOrders()
}

export function getOrder(
  orderId: string,
) {
  return orders.get(
    orderId,
  )
}

export function getOrderForUser(
  orderId: string,
  userId: string,
) {
  const order =
    orders.get(
      orderId,
    )

  if (
    !order ||
    order.userId !==
      userId
  ) {
    return undefined
  }

  return order
}

export function getOrdersByUserId(
  userId: string,
) {
  return Array.from(
    orders.values(),
  )
    .filter(
      (order) =>
        order.userId ===
        userId,
    )
    .sort(
      (
        firstOrder,
        secondOrder,
      ) =>
        new Date(
          secondOrder.createdAt,
        ).getTime() -
        new Date(
          firstOrder.createdAt,
        ).getTime(),
    )
}

export function getOrderByIdempotencyKey(
  userId: string,
  idempotencyKey: string,
) {
  const storageKey =
    createIdempotencyStorageKey(
      userId,
      idempotencyKey,
    )

  return ordersByIdempotencyKey.get(
    storageKey,
  )
}

export function updateOrder(
  orderId: string,
  updates: Partial<Order>,
) {
  const currentOrder =
    orders.get(
      orderId,
    )

  if (!currentOrder) {
    return undefined
  }

  /*
   * O owner de um pedido não deve
   * ser transferido por update.
   */
  const updatedOrder: Order = {
    ...currentOrder,
    ...updates,

    userId:
      currentOrder.userId,
  }

  orders.set(
    orderId,
    updatedOrder,
  )

  for (
    const [
      idempotencyKey,
      order,
    ] of
    ordersByIdempotencyKey
  ) {
    if (
      order.id ===
      orderId
    ) {
      ordersByIdempotencyKey.set(
        idempotencyKey,
        updatedOrder,
      )

      break
    }
  }

  persistOrders()

  return updatedOrder
}

export function clearOrders() {
  orders.clear()

  ordersByIdempotencyKey.clear()

  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.removeItem(
    ORDERS_STORAGE_KEY,
  )

  window.localStorage.removeItem(
    IDEMPOTENCY_STORAGE_KEY,
  )
}