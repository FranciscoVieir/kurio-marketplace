import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
} from '../api/profile'

import type {
  ChangePasswordRequest,
  UpdateCollectorProfileRequest,
} from '../types/profile'

export const profileQueryKeys = {
  me: [
    'me',
    'profile',
  ] as const,
}

export function useProfile() {
  return useQuery({
    queryKey:
      profileQueryKeys.me,

    queryFn:
      getMyProfile,
  })
}

export function useUpdateProfile() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input: UpdateCollectorProfileRequest,
    ) =>
      updateMyProfile(
        input,
      ),

    onSuccess: (
      profile,
    ) => {
      queryClient.setQueryData(
        profileQueryKeys.me,
        profile,
      )
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (
      input: ChangePasswordRequest,
    ) =>
      changeMyPassword(
        input,
      ),
  })
}