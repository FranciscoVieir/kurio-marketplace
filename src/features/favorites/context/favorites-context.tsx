import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

import {
  loadFavoriteIds,
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
  createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({
  children,
}: PropsWithChildren) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(
    () => loadFavoriteIds(GUEST_OWNER_ID),
  )

  useEffect(() => {
    saveFavoriteIds(
      GUEST_OWNER_ID,
      favoriteIds,
    )
  }, [favoriteIds])

  const isFavorite = useCallback(
    (nftId: string) => {
      return favoriteIds.includes(nftId)
    },
    [favoriteIds],
  )

  const addFavorite = useCallback(
    (nftId: string) => {
      setFavoriteIds((currentFavoriteIds) => {
        if (currentFavoriteIds.includes(nftId)) {
          return currentFavoriteIds
        }

        return [
          ...currentFavoriteIds,
          nftId,
        ]
      })
    },
    [],
  )

  const removeFavorite = useCallback(
    (nftId: string) => {
      setFavoriteIds((currentFavoriteIds) =>
        currentFavoriteIds.filter(
          (favoriteId) => favoriteId !== nftId,
        ),
      )
    },
    [],
  )

  const toggleFavorite = useCallback(
    (nftId: string) => {
      setFavoriteIds((currentFavoriteIds) => {
        if (currentFavoriteIds.includes(nftId)) {
          return currentFavoriteIds.filter(
            (favoriteId) => favoriteId !== nftId,
          )
        }

        return [
          ...currentFavoriteIds,
          nftId,
        ]
      })
    },
    [],
  )

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      favoritesCount: favoriteIds.length,
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
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}