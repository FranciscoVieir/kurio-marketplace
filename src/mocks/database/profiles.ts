type StoredProfile = {
  userId: string

  ensName?: string
  walletNickname?: string
  avatar?: string
}

const PROFILES_STORAGE_KEY =
  'kurio:mock:profiles'

function loadProfiles() {
  if (
    typeof window ===
    'undefined'
  ) {
    return new Map<
      string,
      StoredProfile
    >()
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        PROFILES_STORAGE_KEY,
      )

    if (!storedValue) {
      return new Map<
        string,
        StoredProfile
      >()
    }

    const parsed =
      JSON.parse(
        storedValue,
      ) as Array<
        [
          string,
          StoredProfile,
        ]
      >

    return new Map<
      string,
      StoredProfile
    >(
      parsed,
    )
  } catch {
    return new Map<
      string,
      StoredProfile
    >()
  }
}

const profiles =
  loadProfiles()

function persistProfiles() {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.setItem(
    PROFILES_STORAGE_KEY,
    JSON.stringify(
      Array.from(
        profiles.entries(),
      ),
    ),
  )
}

export function getProfileByUserId(
  userId: string,
) {
  return profiles.get(
    userId,
  )
}

type UpdateProfileInput = {
  ensName?: string
  walletNickname?: string
  avatar?: string
}

export function updateProfile(
  userId: string,
  input: UpdateProfileInput,
) {
  const profile: StoredProfile = {
    userId,

    ensName:
      input.ensName,

    walletNickname:
      input.walletNickname,

    avatar:
      input.avatar,
  }

  profiles.set(
    userId,
    profile,
  )

  persistProfiles()

  return profile
}

export function resetProfiles() {
  profiles.clear()

  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.removeItem(
    PROFILES_STORAGE_KEY,
  )
}