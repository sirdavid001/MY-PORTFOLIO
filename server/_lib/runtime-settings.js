const DEFAULT_EXCHANGE_RATE = 1600;

function ensureStore() {
  if (!globalThis.__sirdavidRuntimeSettings) {
    globalThis.__sirdavidRuntimeSettings = {
      exchangeRate: DEFAULT_EXCHANGE_RATE,
    };
  }

  return globalThis.__sirdavidRuntimeSettings;
}

export function getRuntimeExchangeRate() {
  return ensureStore().exchangeRate;
}

export function setRuntimeExchangeRate(value) {
  const numeric = Number(value);
  ensureStore().exchangeRate = Number.isFinite(numeric) && numeric > 0 ? numeric : DEFAULT_EXCHANGE_RATE;
  return ensureStore().exchangeRate;
}

export function getDefaultExchangeRate() {
  return DEFAULT_EXCHANGE_RATE;
}
