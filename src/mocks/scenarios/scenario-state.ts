export type MockScenario =
  | 'default'
  | 'quote-expired'
  | 'insufficient-stock'
  | 'nft-price-changed'
  | 'nft-version-changed'
  | 'session-expired'
  | 'favorite-mutation-error'
  | 'payment-refused'
  | 'payment-timeout'
  | 'catalog-slow'
  | 'catalog-error'

const DEFAULT_SCENARIO: MockScenario =
  'default'

const MOCK_SCENARIO_STORAGE_KEY =
  'kurio:mock-scenario'

const CATALOG_ERROR_ATTEMPTS_STORAGE_KEY =
  'kurio:mock-catalog-error-attempts'

const CATALOG_ERROR_FAILURE_LIMIT =
  2

let fallbackScenario: MockScenario =
  DEFAULT_SCENARIO

let fallbackCatalogErrorAttempts =
  0

function isMockScenario(
  value: unknown,
): value is MockScenario {
  return (
    value === 'default' ||
    value === 'quote-expired' ||
    value === 'insufficient-stock' ||
    value === 'nft-price-changed' ||
    value === 'nft-version-changed' ||
    value === 'session-expired' ||
    value ===
      'favorite-mutation-error' ||
    value ===
      'payment-refused' ||
    value ===
      'payment-timeout' ||
    value ===
      'catalog-slow' ||
    value ===
      'catalog-error'
  )
}

function getScenarioStorage() {
  if (
    typeof window ===
    'undefined'
  ) {
    return null
  }

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

function resetCatalogErrorAttempts() {
  const storage =
    getScenarioStorage()

  fallbackCatalogErrorAttempts =
    0

  if (!storage) {
    return
  }

  storage.removeItem(
    CATALOG_ERROR_ATTEMPTS_STORAGE_KEY,
  )
}

function getCatalogErrorAttempts() {
  const storage =
    getScenarioStorage()

  if (!storage) {
    return fallbackCatalogErrorAttempts
  }

  const storedValue =
    storage.getItem(
      CATALOG_ERROR_ATTEMPTS_STORAGE_KEY,
    )

  if (storedValue === null) {
    return 0
  }

  const parsedValue =
    Number(storedValue)

  if (
    !Number.isInteger(
      parsedValue,
    ) ||
    parsedValue < 0
  ) {
    return 0
  }

  return parsedValue
}

function setCatalogErrorAttempts(
  attempts: number,
) {
  const storage =
    getScenarioStorage()

  if (!storage) {
    fallbackCatalogErrorAttempts =
      attempts

    return
  }

  storage.setItem(
    CATALOG_ERROR_ATTEMPTS_STORAGE_KEY,
    String(attempts),
  )
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
  /*
   * Cada ativação inicia um cenário
   * determinístico do zero.
   *
   * Isso é especialmente importante
   * para catalog-error:
   *
   * request 1 -> falha
   * retry     -> falha
   * retry manual -> sucesso
   */
  resetCatalogErrorAttempts()

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

  resetCatalogErrorAttempts()

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

/*
 * O QueryClient possui retry: 1.
 *
 * Portanto, catalog-error precisa
 * falhar exatamente nas duas primeiras
 * requisições:
 *
 * 1. tentativa inicial
 * 2. retry automático
 *
 * A terceira requisição é disparada
 * pelo botão "Tentar novamente" e deve
 * conseguir concluir normalmente.
 */
export function shouldFailCatalogRequest() {
  if (
    !isScenarioActive(
      'catalog-error',
    )
  ) {
    return false
  }

  const currentAttempts =
    getCatalogErrorAttempts()

  if (
    currentAttempts >=
    CATALOG_ERROR_FAILURE_LIMIT
  ) {
    return false
  }

  setCatalogErrorAttempts(
    currentAttempts + 1,
  )

  return true
}