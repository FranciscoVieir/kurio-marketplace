export type MockScenario =
  | 'default'
  | 'quote-expired'
  | 'insufficient-stock'
  | 'nft-price-changed'
  | 'nft-version-changed'
  | 'session-expired'

const DEFAULT_SCENARIO: MockScenario =
  'default'

const MOCK_SCENARIO_STORAGE_KEY =
  'kurio:mock-scenario'

/*
 * Fallback utilizado somente quando
 * sessionStorage não estiver disponível,
 * por exemplo em algum ambiente que
 * não possua window.
 */
let fallbackScenario: MockScenario =
  DEFAULT_SCENARIO

function isMockScenario(
  value: unknown,
): value is MockScenario {
  return (
    value === 'default' ||
    value === 'quote-expired' ||
    value ===
      'insufficient-stock' ||
    value ===
      'nft-price-changed' ||
    value ===
      'nft-version-changed' ||
    value ===
      'session-expired'
  )
}

function getScenarioStorage() {
  if (
    typeof window === 'undefined'
  ) {
    return null
  }

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function getActiveScenario(): MockScenario {
  const storage =
    getScenarioStorage()

  if (!storage) {
    return fallbackScenario
  }

  const storedScenario =
    storage.getItem(
      MOCK_SCENARIO_STORAGE_KEY,
    )

  if (
    !isMockScenario(
      storedScenario,
    )
  ) {
    return DEFAULT_SCENARIO
  }

  return storedScenario
}

export function setActiveScenario(
  scenario: MockScenario,
) {
  const storage =
    getScenarioStorage()

  if (!storage) {
    fallbackScenario =
      scenario

    return
  }

  storage.setItem(
    MOCK_SCENARIO_STORAGE_KEY,
    scenario,
  )
}

export function resetActiveScenario() {
  const storage =
    getScenarioStorage()

  fallbackScenario =
    DEFAULT_SCENARIO

  if (!storage) {
    return
  }

  storage.removeItem(
    MOCK_SCENARIO_STORAGE_KEY,
  )
}

export function isScenarioActive(
  scenario: MockScenario,
) {
  return (
    getActiveScenario() ===
    scenario
  )
}