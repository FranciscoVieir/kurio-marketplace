export type MockScenario =
  | 'default'
  | 'quote-expired'
  | 'insufficient-stock'
  | 'nft-price-changed'
  | 'nft-version-changed'
  | 'session-expired'

const DEFAULT_SCENARIO: MockScenario =
  'default'

let activeScenario: MockScenario =
  DEFAULT_SCENARIO

export function getActiveScenario() {
  return activeScenario
}

export function setActiveScenario(
  scenario: MockScenario,
) {
  activeScenario = scenario
}

export function resetActiveScenario() {
  activeScenario =
    DEFAULT_SCENARIO
}

export function isScenarioActive(
  scenario: MockScenario,
) {
  return activeScenario === scenario
}