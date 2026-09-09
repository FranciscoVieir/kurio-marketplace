import { api } from '@/services/api/client'

import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/auth'

export async function login(
  payload: LoginRequest,
) {
  const response =
    await api.post<AuthResponse>(
      '/auth/login',
      payload,
    )

  return response.data
}

export async function register(
  payload: RegisterRequest,
) {
  const response =
    await api.post<AuthResponse>(
      '/auth/register',
      payload,
    )

  return response.data
}

export async function getSession() {
  const response =
    await api.get<AuthResponse>(
      '/auth/session',
    )

  return response.data
}

export async function logout() {
  await api.post(
    '/auth/logout',
  )
}