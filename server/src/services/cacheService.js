const cache = new Map();

export function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (item.expiresAt && item.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

export function setCache(key, value, ttlMs = 60_000) {
  cache.set(key, {
    value,
    expiresAt: ttlMs ? Date.now() + ttlMs : null
  });
  return value;
}

export function clearCache() {
  cache.clear();
}
