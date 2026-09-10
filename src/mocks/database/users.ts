import {
  compareSync,
  hashSync,
} from 'bcryptjs'

import type {
  AuthUser,
  RegisterRequest,
} from '@/features/auth/types/auth'

type StoredUser = AuthUser & {
  passwordHash: string
}

type LegacyStoredUser =
  AuthUser & {
    password: string
  }

const USERS_STORAGE_KEY =
  'kurio:mock:users'

const PASSWORD_SALT_ROUNDS =
  10

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

function hashPassword(
  password: string,
) {
  return hashSync(
    password,
    PASSWORD_SALT_ROUNDS,
  )
}

function isLegacyStoredUser(
  value: unknown,
): value is LegacyStoredUser {
  if (
    typeof value !==
      'object' ||
    value === null
  ) {
    return false
  }

  const user =
    value as Record<
      string,
      unknown
    >

  return (
    typeof user.id ===
      'string' &&
    typeof user.username ===
      'string' &&
    typeof user.email ===
      'string' &&
    typeof user.password ===
      'string'
  )
}

function isStoredUser(
  value: unknown,
): value is StoredUser {
  if (
    typeof value !==
      'object' ||
    value === null
  ) {
    return false
  }

  const user =
    value as Record<
      string,
      unknown
    >

  return (
    typeof user.id ===
      'string' &&
    typeof user.username ===
      'string' &&
    typeof user.email ===
      'string' &&
    typeof user.passwordHash ===
      'string'
  )
}

function loadUsers(): StoredUser[] {
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

    const parsed: unknown =
      JSON.parse(
        storedUsers,
      )

    if (
      !Array.isArray(
        parsed,
      )
    ) {
      return []
    }

    let requiresMigration =
      false

    const normalizedUsers =
      parsed.flatMap(
        (
          value,
        ): StoredUser[] => {
          if (
            isStoredUser(
              value,
            )
          ) {
            return [
              value,
            ]
          }

          /*
           * Compatibilidade com
           * usuários criados antes
           * da alteração.
           *
           * A senha antiga em texto
           * puro é convertida para
           * hash e não é mantida no
           * novo registro.
           */
          if (
            isLegacyStoredUser(
              value,
            )
          ) {
            requiresMigration =
              true

            const {
              password,
              ...publicFields
            } = value

            return [
              {
                ...publicFields,

                passwordHash:
                  hashPassword(
                    password,
                  ),
              },
            ]
          }

          return []
        },
      )

    if (
      requiresMigration
    ) {
      window.localStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(
          normalizedUsers,
        ),
      )
    }

    return normalizedUsers
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
    !compareSync(
      password,
      user.passwordHash,
    )
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
    !user
  ) {
    return false
  }

  return compareSync(
    password,
    user.passwordHash,
  )
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

    passwordHash:
      hashPassword(
        request.password,
      ),

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

    passwordHash:
      hashPassword(
        password,
      ),
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