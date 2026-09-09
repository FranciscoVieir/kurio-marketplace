import type {
  AuthSession,
} from '@/features/auth/types/auth'

const SESSIONS_STORAGE_KEY =
  'kurio:mock:sessions'

const ACTIVE_SESSION_STORAGE_KEY =
  'kurio:mock:active-session'

const SESSION_DURATION_MS =
  24 * 60 * 60 * 1000

function loadSessions() {
  if (
    typeof window === 'undefined'
  ) {
    return []
  }

  try {
    const storedSessions =
      window.localStorage.getItem(
        SESSIONS_STORAGE_KEY,
      )

    if (!storedSessions) {
      return []
    }

    const parsed =
      JSON.parse(
        storedSessions,
      ) as AuthSession[]

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
  } catch {
    return []
  }
}

let sessions: AuthSession[] =
  loadSessions()

function persistSessions() {
  if (
    typeof window === 'undefined'
  ) {
    return
  }

  window.localStorage.setItem(
    SESSIONS_STORAGE_KEY,
    JSON.stringify(
      sessions,
    ),
  )
}

export function createSession(
  userId: string,
) {
  const now =
    Date.now()

  const session: AuthSession = {
    id:
      `session_${crypto.randomUUID()}`,

    userId,

    createdAt:
      new Date(
        now,
      ).toISOString(),

    expiresAt:
      new Date(
        now +
          SESSION_DURATION_MS,
      ).toISOString(),
  }

  sessions.push(session)

  persistSessions()

  if (
    typeof window !==
    'undefined'
  ) {
    window.localStorage.setItem(
      ACTIVE_SESSION_STORAGE_KEY,
      session.id,
    )
  }

  return session
}

export function getSessionById(
  sessionId: string,
) {
  return sessions.find(
    (session) =>
      session.id ===
      sessionId,
  )
}

export function getActiveSession() {
  if (
    typeof window === 'undefined'
  ) {
    return undefined
  }

  const activeSessionId =
    window.localStorage.getItem(
      ACTIVE_SESSION_STORAGE_KEY,
    )

  if (!activeSessionId) {
    return undefined
  }

  return getSessionById(
    activeSessionId,
  )
}

export function isSessionExpired(
  session: AuthSession,
) {
  const expiresAt =
    new Date(
      session.expiresAt,
    ).getTime()

  return (
    !Number.isFinite(
      expiresAt,
    ) ||
    expiresAt <= Date.now()
  )
}

export function deleteSession(
  sessionId: string,
) {
  sessions =
    sessions.filter(
      (session) =>
        session.id !==
        sessionId,
    )

  persistSessions()

  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  const activeSessionId =
    window.localStorage.getItem(
      ACTIVE_SESSION_STORAGE_KEY,
    )

  if (
    activeSessionId ===
    sessionId
  ) {
    window.localStorage.removeItem(
      ACTIVE_SESSION_STORAGE_KEY,
    )
  }
}

export function clearActiveSession() {
  if (
    typeof window === 'undefined'
  ) {
    return
  }

  window.localStorage.removeItem(
    ACTIVE_SESSION_STORAGE_KEY,
  )
}

export function resetSessions() {
  sessions = []

  if (
    typeof window === 'undefined'
  ) {
    return
  }

  window.localStorage.removeItem(
    SESSIONS_STORAGE_KEY,
  )

  window.localStorage.removeItem(
    ACTIVE_SESSION_STORAGE_KEY,
  )
}