import {
  api,
} from '@/services/api/client'

import type {
  CartState,
} from '../types/cart'

export type AddCartItemRequest = {
  nftId: string
  quantity: number
}

export type UpdateCartItemRequest = {
  quantity: number
}

export type UpdateCartCouponRequest = {
  couponCode: string | null
}

export async function getCart() {
  const response =
    await api.get<CartState>(
      '/cart',
    )

  return response.data
}

export async function addCartItem(
  input: AddCartItemRequest,
) {
  const response =
    await api.post<CartState>(
      '/cart/items',
      input,
    )

  return response.data
}

export async function updateCartItem(
  nftId: string,
  input: UpdateCartItemRequest,
) {
  const response =
    await api.patch<CartState>(
      `/cart/items/${nftId}`,
      input,
    )

  return response.data
}

export async function removeCartItem(
  nftId: string,
) {
  const response =
    await api.delete<CartState>(
      `/cart/items/${nftId}`,
    )

  return response.data
}

export async function updateCartCoupon(
  input: UpdateCartCouponRequest,
) {
  const response =
    await api.patch<CartState>(
      '/cart/coupon',
      input,
    )

  return response.data
}

export async function clearCartRequest() {
  const response =
    await api.delete<CartState>(
      '/cart',
    )

  return response.data
}
