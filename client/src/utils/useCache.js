// Simple localStorage cache with TTL
export function getLocalCache(key) {
  const item = localStorage.getItem(key);
  if (!item) return null;
  try {
    const { value, expiry } = JSON.parse(item);
    if (expiry && Date.now() > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return value;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function setLocalCache(key, value, ttl = 3600) {
  const expiry = Date.now() + ttl * 1000;
  localStorage.setItem(key, JSON.stringify({ value, expiry }));
}

export function deleteLocalCache(key) {
  localStorage.removeItem(key);
} 