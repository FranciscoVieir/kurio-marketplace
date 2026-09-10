export type CollectorProfile = {
  userId: string

  displayName: string
  username: string
  email: string

  ensName?: string
  walletNickname?: string
  avatar?: string
}

export type UpdateCollectorProfileRequest = {
  displayName: string
  username: string
  email: string

  ensName?: string
  walletNickname?: string
  avatar?: string
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}