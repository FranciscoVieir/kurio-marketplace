import { api } from '@/services/api/client'

import type {
  ChangePasswordRequest,
  CollectorProfile,
  UpdateCollectorProfileRequest,
} from '../types/profile'

export async function getMyProfile() {
  const response =
    await api.get<CollectorProfile>(
      '/me/profile',
    )

  return response.data
}

export async function updateMyProfile(
  input: UpdateCollectorProfileRequest,
) {
  const response =
    await api.patch<CollectorProfile>(
      '/me/profile',
      input,
    )

  return response.data
}

export async function changeMyPassword(
  input: ChangePasswordRequest,
) {
  await api.patch(
    '/me/password',
    input,
  )
}