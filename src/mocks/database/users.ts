import type {
  AuthUser,
  RegisterRequest,
} from '@/features/auth/types/auth'

type StoredUser = AuthUser & {
  password: string
}

const USERS_STORAGE_KEY =
  'kurio:mock:users'

function loadUsers() {
  if (
    typeof window ===
    'undefined'
  ) {
    return []
  }

  try {
    const storedUsers =
      window.localStorage.getItem(
        USERS_STORAGE_KEY,
      )

    if (!storedUsers) {
      return []
    }

    const parsed =
      JSON.parse(
        storedUsers,
      ) as StoredUser[]

    if (
      !Array.isArray(
        parsed,
      )
    ) {
      return []
    }

    return parsed
  } catch {
    return []
  }
}

let users: StoredUser[] =
  loadUsers()

function persistUsers() {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify(
      users,
    ),
  )
}

function normalizeEmail(
  email: string,
) {
  return email
    .trim()
    .toLowerCase()
}

function normalizeUsername(
  username: string,
) {
  return username
    .trim()
    .toLowerCase()
}

export function getUserById(
  userId: string,
) {
  return users.find(
    (user) =>
      user.id ===
      userId,
  )
}

export function getUserByEmail(
  email: string,
) {
  const normalizedEmail =
    normalizeEmail(
      email,
    )

  return users.find(
    (user) =>
      normalizeEmail(
        user.email,
      ) ===
      normalizedEmail,
  )
}

export function getUserByUsername(
  username: string,
) {
  const normalizedUsername =
    normalizeUsername(
      username,
    )

  return users.find(
    (user) =>
      normalizeUsername(
        user.username,
      ) ===
      normalizedUsername,
  )
}

export function validateUserCredentials(
  email: string,
  password: string,
) {
  const user =
    getUserByEmail(
      email,
    )

  if (
    !user ||
    user.password !==
      password
  ) {
    return undefined
  }

  return user
}

export function validateUserPassword(
  userId: string,
  password: string,
) {
  const user =
    getUserById(
      userId,
    )

  if (
    !user ||
    user.password !==
      password
  ) {
    return false
  }

  return true
}

export function createUser(
  request: RegisterRequest,
) {
  const user: StoredUser = {
    id:
      `user_${crypto.randomUUID()}`,

    username:
      request.username.trim(),

    email:
      normalizeEmail(
        request.email,
      ),

    displayName:
      request.username.trim(),

    password:
      request.password,

    createdAt:
      new Date().toISOString(),
  }

  users.push(
    user,
  )

  persistUsers()

  return user
}

type UpdateUserIdentityInput = {
  displayName: string
  username: string
  email: string
}

export function updateUserIdentity(
  userId: string,
  input: UpdateUserIdentityInput,
) {
  const index =
    users.findIndex(
      (user) =>
        user.id ===
        userId,
    )

  if (
    index === -1
  ) {
    return undefined
  }

  const currentUser =
    users[index]

  const updatedUser: StoredUser = {
    ...currentUser,

    displayName:
      input.displayName.trim(),

    username:
      input.username.trim(),

    email:
      normalizeEmail(
        input.email,
      ),
  }

  users[index] =
    updatedUser

  persistUsers()

  return updatedUser
}

export function updateUserPassword(
  userId: string,
  password: string,
) {
  const index =
    users.findIndex(
      (user) =>
        user.id ===
        userId,
    )

  if (
    index === -1
  ) {
    return undefined
  }

  const updatedUser: StoredUser = {
    ...users[index],

    password,
  }

  users[index] =
    updatedUser

  persistUsers()

  return updatedUser
}

export function toPublicUser(
  user: StoredUser,
): AuthUser {
  return {
    id:
      user.id,

    username:
      user.username,

    email:
      user.email,

    displayName:
      user.displayName,

    createdAt:
      user.createdAt,
  }
}

export function resetUsers() {
  users = []

  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.removeItem(
    USERS_STORAGE_KEY,
  )
}