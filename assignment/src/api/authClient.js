import axios from 'axios'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '../auth/tokenStorage'

const API_DOMAIN = import.meta.env.VITE_API_DOMAIN ?? ''
const REFRESH_ENDPOINT = '/refresh'

function normalizeTokenPayload(data) {
  const accessToken = data?.accessToken ?? data?.token ?? data?.access_token
  const refreshToken = data?.refreshToken ?? data?.refresh_token

  if (!accessToken) {
    throw new Error('Refresh response did not include an access token.')
  }

  return { accessToken, refreshToken }
}

export function createAuthClient({
  baseURL = API_DOMAIN,
  refreshPath = REFRESH_ENDPOINT,
  onAuthFailure,
} = {}) {
  const api = axios.create({
    baseURL,
  })

  let refreshPromise = null
  let queuedRequests = []

  const flushQueue = ({ error, accessToken }) => {
    queuedRequests.forEach(({ config, resolve, reject }) => {
      if (error) {
        reject(error)
        return
      }

      const nextConfig = {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      }

      resolve(api(nextConfig))
    })

    queuedRequests = []
  }

  const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      throw new Error('No refresh token available.')
    }

    const response = await axios({
      baseURL,
      method: 'post',
      url: refreshPath,
      data: { refreshToken },
    })

    const nextTokens = normalizeTokenPayload(response.data)

    setAuthTokens({
      accessToken: nextTokens.accessToken,
      refreshToken: nextTokens.refreshToken ?? refreshToken,
    })

    api.defaults.headers.common.Authorization = `Bearer ${nextTokens.accessToken}`

    return nextTokens.accessToken
  }

  api.interceptors.request.use(
    (config) => {
      const accessToken = getAccessToken()

      if (!accessToken) {
        return config
      }

      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    },
    (error) => Promise.reject(error),
  )

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      const status = error.response?.status
      const isRefreshRequest = originalRequest?.url?.includes(refreshPath)

      if (status !== 401 || !originalRequest || originalRequest._retry || isRefreshRequest) {
        return Promise.reject(error)
      }

      if (refreshPromise) {
        return new Promise((resolve, reject) => {
          queuedRequests.push({ config: originalRequest, resolve, reject })
        })
      }

      originalRequest._retry = true
      refreshPromise = refreshAccessToken()

      try {
        const nextAccessToken = await refreshPromise

        flushQueue({ accessToken: nextAccessToken })

        return api({
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${nextAccessToken}`,
          },
        })
      } catch (refreshError) {
        clearAuthTokens()
        flushQueue({ error: refreshError })

        if (typeof onAuthFailure === 'function') {
          onAuthFailure(refreshError)
        }

        return Promise.reject(refreshError)
      } finally {
        refreshPromise = null
      }
    },
  )

  return api
}

const authClient = createAuthClient()

export default authClient