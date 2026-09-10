import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  getSession,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '@/features/auth/api/auth'

import type {
  AuthSession,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '@/features/auth/types/auth'

type AuthContextValue = {
  user: AuthUser | null
  session: AuthSession | null

  isAuthenticated: boolean
  isInitializing: boolean

  login: (
    payload: LoginRequest,
  ) => Promise<AuthUser>

  register: (
    payload: RegisterRequest,
  ) => Promise<AuthUser>

  logout: () => Promise<void>

  refreshSession: () => Promise<void>

  syncUser: (
    user: AuthUser,
  ) => void
}

export const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  )

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    user,
    setUser,
  ] =
    useState<AuthUser | null>(
      null,
    )

  const [
    session,
    setSession,
  ] =
    useState<AuthSession | null>(
      null,
    )

  const [
    isInitializing,
    setIsInitializing,
  ] = useState(true)

  const clearAuthState =
    useCallback(() => {
      setUser(null)
      setSession(null)
    }, [])

  const syncUser =
    useCallback(
      (
        nextUser: AuthUser,
      ) => {
        setUser(
          nextUser,
        )
      },
      [],
    )

  const refreshSession =
    useCallback(
      async () => {
        try {
          const response =
            await getSession()

          setUser(
            response.user,
          )

          setSession(
            response.session,
          )
        } catch {
          clearAuthState()
        }
      },
      [
        clearAuthState,
      ],
    )

  useEffect(() => {
    let active = true

    async function initializeAuth() {
      try {
        const response =
          await getSession()

        if (!active) {
          return
        }

        setUser(
          response.user,
        )

        setSession(
          response.session,
        )
      } catch {
        if (!active) {
          return
        }

        clearAuthState()
      } finally {
        if (active) {
          setIsInitializing(
            false,
          )
        }
      }
    }

    void initializeAuth()

    return () => {
      active = false
    }
  }, [
    clearAuthState,
  ])

  const login =
    useCallback(
      async (
        payload: LoginRequest,
      ) => {
        const response =
          await loginRequest(
            payload,
          )

        setUser(
          response.user,
        )

        setSession(
          response.session,
        )

        return response.user
      },
      [],
    )

  const register =
    useCallback(
      async (
        payload: RegisterRequest,
      ) => {
        const response =
          await registerRequest(
            payload,
          )

        setUser(
          response.user,
        )

        setSession(
          response.session,
        )

        return response.user
      },
      [],
    )

  const logout =
    useCallback(
      async () => {
        try {
          await logoutRequest()
        } finally {
          clearAuthState()
        }
      },
      [
        clearAuthState,
      ],
    )

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,
        session,

        isAuthenticated:
          Boolean(
            user &&
              session,
          ),

        isInitializing,

        login,
        register,
        logout,
        refreshSession,
        syncUser,
      }),
      [
        user,
        session,
        isInitializing,
        login,
        register,
        logout,
        refreshSession,
        syncUser,
      ],
    )

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}