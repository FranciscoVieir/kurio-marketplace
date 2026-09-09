export type AuthUser = {
  id: string
  username: string
  email: string
  displayName: string
  createdAt: string
}

export type AuthSession = {
  id: string
  userId: string
  expiresAt: string
  createdAt: string
}

export type AuthState = {
  user: AuthUser | null
  session: AuthSession | null
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export type AuthResponse = {
  user: AuthUser
  session: AuthSession
}