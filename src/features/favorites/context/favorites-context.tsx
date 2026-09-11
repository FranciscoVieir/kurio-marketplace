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
  setFavorite,
} from '../api/set-favorite'

import {
  loadFavoriteIds,
  mergeFavoriteIds,
  saveFavoriteIds,
} from '../lib/favorites-storage'

const GUEST_OWNER_ID =
  'guest'

const FAVORITE_ERROR_MESSAGE =
  'Não foi possível atualizar o favorito. A alteração foi desfeita.'

type FavoritesContextValue = {
  favoriteIds: string[]
  favoritesCount: number

  isFavorite: (
    nftId: string,
  ) => boolean

  addFavorite: (
    nftId: string,
  ) => Promise<void>

  removeFavorite: (
    nftId: string,
  ) => Promise<void>

  toggleFavorite: (
    nftId: string,
  ) => Promise<void>
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
    isAuthenticated &&
    user
      ? user.id
      : GUEST_OWNER_ID

  const [
    favoriteIds,
    setFavoriteIds,
  ] = useState<string[]>(
    [],
  )

  const [
    favoriteError,
    setFavoriteError,
  ] = useState<
    string | null
  >(null)

  /*
   * Mantém acesso síncrono ao
   * estado mais recente durante
   * optimistic updates.
   */
  const favoriteIdsRef =
    useRef<string[]>(
      [],
    )

  const activeOwnerRef =
    useRef<
      string | null
    >(null)

  const hasInitializedRef =
    useRef(false)

  /*
   * Impede que o estado pertencente
   * ao owner anterior seja salvo no
   * novo owner durante login/logout.
   */
  const skipPersistenceRef =
    useRef(false)

  const replaceFavoriteIds =
    useCallback(
      (
        nextFavoriteIds:
          string[],
      ) => {
        favoriteIdsRef.current =
          nextFavoriteIds

        setFavoriteIds(
          nextFavoriteIds,
        )
      },
      [],
    )

  useEffect(() => {
    favoriteIdsRef.current =
      favoriteIds
  }, [
    favoriteIds,
  ])

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

      replaceFavoriteIds(
        nextFavorites,
      )

      setFavoriteError(
        null,
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
     */
    if (
      previousOwnerId ===
        GUEST_OWNER_ID &&
      isAuthenticated &&
      user
    ) {
      saveFavoriteIds(
        GUEST_OWNER_ID,
        favoriteIdsRef.current,
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

      replaceFavoriteIds(
        mergedFavorites,
      )

      setFavoriteError(
        null,
      )

      return
    }

    /*
     * usuário → guest
     *
     * Favoritos privados não são
     * transferidos para guest.
     */
    skipPersistenceRef.current =
      true

    activeOwnerRef.current =
      ownerId

    replaceFavoriteIds(
      loadFavoriteIds(
        ownerId,
      ),
    )

    setFavoriteError(
      null,
    )
  }, [
    isAuthenticated,
    isInitializing,
    ownerId,
    replaceFavoriteIds,
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
      (
        nftId: string,
      ) => {
        return favoriteIds.includes(
          nftId,
        )
      },
      [
        favoriteIds,
      ],
    )

  const mutateFavorite =
    useCallback(
      async (
        nftId: string,
        shouldBeFavorite:
          boolean,
      ) => {
        setFavoriteError(
          null,
        )

        const previousFavoriteIds =
          favoriteIdsRef.current

        const nextFavoriteIds =
          shouldBeFavorite
            ? Array.from(
                new Set([
                  ...previousFavoriteIds,
                  nftId,
                ]),
              )
            : previousFavoriteIds.filter(
                (
                  favoriteId,
                ) =>
                  favoriteId !==
                  nftId,
              )

        /*
         * Optimistic update:
         * UI muda imediatamente.
         */
        replaceFavoriteIds(
          nextFavoriteIds,
        )

        try {
          await setFavorite(
            nftId,
            shouldBeFavorite,
          )
        } catch {
          /*
           * Rollback:
           * restaura exatamente
           * o estado anterior.
           */
          replaceFavoriteIds(
            previousFavoriteIds,
          )

          setFavoriteError(
            FAVORITE_ERROR_MESSAGE,
          )
        }
      },
      [
        replaceFavoriteIds,
      ],
    )

  const addFavorite =
    useCallback(
      async (
        nftId: string,
      ) => {
        if (
          favoriteIdsRef.current.includes(
            nftId,
          )
        ) {
          return
        }

        await mutateFavorite(
          nftId,
          true,
        )
      },
      [
        mutateFavorite,
      ],
    )

  const removeFavorite =
    useCallback(
      async (
        nftId: string,
      ) => {
        if (
          !favoriteIdsRef.current.includes(
            nftId,
          )
        ) {
          return
        }

        await mutateFavorite(
          nftId,
          false,
        )
      },
      [
        mutateFavorite,
      ],
    )

  const toggleFavorite =
    useCallback(
      async (
        nftId: string,
      ) => {
        const shouldBeFavorite =
          !favoriteIdsRef.current.includes(
            nftId,
          )

        await mutateFavorite(
          nftId,
          shouldBeFavorite,
        )
      },
      [
        mutateFavorite,
      ],
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

      {favoriteError && (
        <p
          role="alert"
          className="sr-only"
        >
          {favoriteError}
        </p>
      )}
    </FavoritesContext.Provider>
  )
}