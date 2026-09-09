import type { Order } from '@/features/checkout/types/checkout'

const orders = new Map<string, Order>()

const ordersByIdempotencyKey =
  new Map<string, Order>()

export function saveOrder(
  order: Order,
  idempotencyKey: string,
) {
  orders.set(
    order.id,
    order,
  )

  ordersByIdempotencyKey.set(
    idempotencyKey,
    order,
  )
}

export function getOrder(
  orderId: string,
) {
  return orders.get(orderId)
}

export function getOrderByIdempotencyKey(
  idempotencyKey: string,
) {
  return ordersByIdempotencyKey.get(
    idempotencyKey,
  )
}

export function updateOrder(
  orderId: string,
  updates: Partial<Order>,
) {
  const currentOrder =
    orders.get(orderId)

  if (!currentOrder) {
    return undefined
  }

  const updatedOrder: Order = {
    ...currentOrder,
    ...updates,
  }

  orders.set(
    orderId,
    updatedOrder,
  )

  for (
    const [
      idempotencyKey,
      order,
    ] of ordersByIdempotencyKey
  ) {
    if (order.id === orderId) {
      ordersByIdempotencyKey.set(
        idempotencyKey,
        updatedOrder,
      )

      break
    }
  }

  return updatedOrder
}

export function clearOrders() {
  orders.clear()
  ordersByIdempotencyKey.clear()
}