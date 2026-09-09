import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'

import { useAuth } from '@/features/auth/hooks/use-auth'

import {
  loadFavoriteIds,
  mergeFavoriteIds,
  saveFavoriteIds,
} from '../lib/favorites-storage'

const GUEST_OWNER_ID = 'guest'

type FavoritesContextValue = {
  favoriteIds: string[]
  favoritesCount: number
  isFavorite: (nftId: string) => boolean
  addFavorite: (nftId: string) => void
  removeFavorite: (nftId: string) => void
  toggleFavorite: (nftId: string) => void
}

export const FavoritesContext =
  createContext<FavoritesContextValue | null>(
    null,
  )

export function FavoritesProvider({
  children,
}: PropsWithChildren) {
  const {
    user,
    isAuthenticated,
    isInitializing,
  } = useAuth()

  const ownerId =
    isAuthenticated && user
      ? user.id
      : GUEST_OWNER_ID

  const [
    favoriteIds,
    setFavoriteIds,
  ] = useState<string[]>([])

  const activeOwnerRef =
    useRef<string | null>(
      null,
    )

  const hasInitializedRef =
    useRef(false)

  /*
   * Impede que o estado pertencente
   * ao owner anterior seja salvo no
   * novo owner durante login/logout.
   */
  const skipPersistenceRef =
    useRef(false)

  useEffect(() => {
    if (isInitializing) {
      return
    }

    const previousOwnerId =
      activeOwnerRef.current

    /*
     * Primeira resolução da
     * autenticação.
     */
    if (
      !hasInitializedRef.current
    ) {
      const nextFavorites =
        isAuthenticated &&
        user
          ? mergeFavoriteIds(
              GUEST_OWNER_ID,
              user.id,
            )
          : loadFavoriteIds(
              GUEST_OWNER_ID,
            )

      skipPersistenceRef.current =
        true

      activeOwnerRef.current =
        ownerId

      hasInitializedRef.current =
        true

      setFavoriteIds(
        nextFavorites,
      )

      return
    }

    if (
      previousOwnerId ===
      ownerId
    ) {
      return
    }

    /*
     * guest → usuário
     *
     * Login ou cadastro.
     */
    if (
      previousOwnerId ===
        GUEST_OWNER_ID &&
      isAuthenticated &&
      user
    ) {
      /*
       * Persiste primeiro o estado
       * guest mais recente.
       */
      saveFavoriteIds(
        GUEST_OWNER_ID,
        favoriteIds,
      )

      const mergedFavorites =
        mergeFavoriteIds(
          GUEST_OWNER_ID,
          user.id,
        )

      skipPersistenceRef.current =
        true

      activeOwnerRef.current =
        user.id

      setFavoriteIds(
        mergedFavorites,
      )

      return
    }

    /*
     * usuário → guest
     *
     * Logout ou expiração.
     *
     * Os favoritos privados da
     * conta não são transferidos
     * para o guest.
     */
    skipPersistenceRef.current =
      true

    activeOwnerRef.current =
      ownerId

    setFavoriteIds(
      loadFavoriteIds(
        ownerId,
      ),
    )
  }, [
    favoriteIds,
    isAuthenticated,
    isInitializing,
    ownerId,
    user,
  ])

  useEffect(() => {
    if (
      isInitializing ||
      !hasInitializedRef.current ||
      activeOwnerRef.current !==
        ownerId
    ) {
      return
    }

    if (
      skipPersistenceRef.current
    ) {
      skipPersistenceRef.current =
        false

      return
    }

    saveFavoriteIds(
      ownerId,
      favoriteIds,
    )
  }, [
    favoriteIds,
    isInitializing,
    ownerId,
  ])

  const isFavorite =
    useCallback(
      (nftId: string) => {
        return favoriteIds.includes(
          nftId,
        )
      },
      [
        favoriteIds,
      ],
    )

  const addFavorite =
    useCallback(
      (nftId: string) => {
        setFavoriteIds(
          (
            currentFavoriteIds,
          ) => {
            if (
              currentFavoriteIds.includes(
                nftId,
              )
            ) {
              return currentFavoriteIds
            }

            return [
              ...currentFavoriteIds,
              nftId,
            ]
          },
        )
      },
      [],
    )

  const removeFavorite =
    useCallback(
      (nftId: string) => {
        setFavoriteIds(
          (
            currentFavoriteIds,
          ) =>
            currentFavoriteIds.filter(
              (
                favoriteId,
              ) =>
                favoriteId !==
                nftId,
            ),
        )
      },
      [],
    )

  const toggleFavorite =
    useCallback(
      (nftId: string) => {
        setFavoriteIds(
          (
            currentFavoriteIds,
          ) => {
            if (
              currentFavoriteIds.includes(
                nftId,
              )
            ) {
              return currentFavoriteIds.filter(
                (
                  favoriteId,
                ) =>
                  favoriteId !==
                  nftId,
              )
            }

            return [
              ...currentFavoriteIds,
              nftId,
            ]
          },
        )
      },
      [],
    )

  const value =
    useMemo<FavoritesContextValue>(
      () => ({
        favoriteIds,
        favoritesCount:
          favoriteIds.length,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
      }),
      [
        favoriteIds,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
      ],
    )

  return (
    <FavoritesContext.Provider
      value={value}
    >
      {children}
    </FavoritesContext.Provider>
  )
}