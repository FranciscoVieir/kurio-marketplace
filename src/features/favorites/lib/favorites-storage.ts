const FAVORITES_STORAGE_PREFIX =
  'kurio:favorites'

function getStorageKey(
  ownerId: string,
) {
  return `${FAVORITES_STORAGE_PREFIX}:${ownerId}`
}

function isStringArray(
  value: unknown,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item ===
        'string',
    )
  )
}

export function loadFavoriteIds(
  ownerId: string,
): string[] {
  if (
    typeof window ===
    'undefined'
  ) {
    return []
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        getStorageKey(
          ownerId,
        ),
      )

    if (!storedValue) {
      return []
    }

    const parsedValue: unknown =
      JSON.parse(
        storedValue,
      )

    if (
      !isStringArray(
        parsedValue,
      )
    ) {
      return []
    }

    return Array.from(
      new Set(
        parsedValue,
      ),
    )
  } catch {
    return []
  }
}

export function saveFavoriteIds(
  ownerId: string,
  favoriteIds: string[],
) {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  const normalizedFavoriteIds =
    Array.from(
      new Set(
        favoriteIds,
      ),
    )

  window.localStorage.setItem(
    getStorageKey(
      ownerId,
    ),
    JSON.stringify(
      normalizedFavoriteIds,
    ),
  )
}

export function clearFavoriteIds(
  ownerId: string,
) {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.removeItem(
    getStorageKey(
      ownerId,
    ),
  )
}

export function mergeFavoriteIds(
  sourceOwnerId: string,
  targetOwnerId: string,
) {
  if (
    sourceOwnerId ===
    targetOwnerId
  ) {
    return loadFavoriteIds(
      targetOwnerId,
    )
  }

  const sourceFavorites =
    loadFavoriteIds(
      sourceOwnerId,
    )

  const targetFavorites =
    loadFavoriteIds(
      targetOwnerId,
    )

  const mergedFavorites =
    Array.from(
      new Set([
        ...targetFavorites,
        ...sourceFavorites,
      ]),
    )

  saveFavoriteIds(
    targetOwnerId,
    mergedFavorites,
  )

  clearFavoriteIds(
    sourceOwnerId,
  )

  return mergedFavorites
}