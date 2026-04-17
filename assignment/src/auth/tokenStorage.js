const ACCESS_TOKEN_KEY = 'APIToken'
const LEGACY_ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

const memoryStorage = new Map()

function getStorage() {
  if (
    typeof window !== 'undefined' &&
    window.localStorage &&
    typeof window.localStorage.getItem === 'function' &&
    typeof window.localStorage.setItem === 'function' &&
    typeof window.localStorage.removeItem === 'function'
  ) {
    return window.localStorage
  }

  return {
    getItem(key) {
      return memoryStorage.get(key) ?? null
    },
    setItem(key, value) {
      memoryStorage.set(key, value)
    },
    removeItem(key) {
      memoryStorage.delete(key)
    },
  }
}

export function getAccessToken() {
  const storage = getStorage()

  return (
    storage.getItem(ACCESS_TOKEN_KEY) ??
    storage.getItem(LEGACY_ACCESS_TOKEN_KEY)
  )
}

export function getRefreshToken() {
  return getStorage().getItem(REFRESH_TOKEN_KEY)
}

export function setAuthTokens({ accessToken, refreshToken }) {
  const storage = getStorage()

  if (accessToken) {
    storage.setItem(ACCESS_TOKEN_KEY, accessToken)
    storage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
  }

  if (refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export function clearAuthTokens() {
  const storage = getStorage()

  storage.removeItem(ACCESS_TOKEN_KEY)
  storage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
  storage.removeItem(REFRESH_TOKEN_KEY)
}

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY }