import axios from 'axios'
import { useEffect, useState } from 'react'
import authClient from '../api/authClient'
import { normalizeAuthPayload } from './authPayload'
import AuthContext from './authContext'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from './tokenStorage'

const API_DOMAIN = import.meta.env.VITE_API_DOMAIN ?? ''
const LOGIN_ENDPOINT = '/auth/login'

function buildAnonymousState(error = null) {
  return {
    status: 'anonymous',
    isAuthenticated: false,
    isLoading: false,
    accessToken: null,
    refreshToken: null,
    user: null,
    error,
  }
}

function buildAuthenticatedState({ accessToken, refreshToken, user = null }) {
  return {
    status: 'authenticated',
    isAuthenticated: true,
    isLoading: false,
    accessToken,
    refreshToken,
    user,
    error: null,
  }
}

function getInitialAuthState() {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()

  if (!accessToken) {
    return buildAnonymousState()
  }

  return buildAuthenticatedState({
    accessToken,
    refreshToken,
  })
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getInitialAuthState)

  useEffect(() => {
    const handleAuthFailure = () => {
      clearAuthTokens()
      delete authClient.defaults.headers.common.Authorization
      setAuthState(buildAnonymousState('Your session expired. Please log in again.'))
    }

    authClient.setOnAuthFailure(handleAuthFailure)

    return () => {
      authClient.setOnAuthFailure(undefined)
    }
  }, [])

  const login = async (credentials, options = {}) => {
    const loginPath = options.loginPath ?? LOGIN_ENDPOINT

    setAuthState((currentState) => ({
      ...currentState,
      status: 'authenticating',
      isLoading: true,
      error: null,
    }))

    try {
      const response = await axios({
        baseURL: API_DOMAIN,
        method: 'post',
        url: loginPath,
        data: credentials,
      })

      const nextAuth = normalizeAuthPayload(response.data)
      const nextUser = nextAuth.user
        ? {
            ...nextAuth.user,
            email: nextAuth.user.email ?? credentials.email,
          }
        : {
            email: credentials.email,
          }

      if (!nextAuth.refreshToken) {
        throw new Error('Login response did not include a refresh token.')
      }

      setAuthTokens({
        accessToken: nextAuth.accessToken,
        refreshToken: nextAuth.refreshToken,
      })

      authClient.defaults.headers.common.Authorization = `Bearer ${nextAuth.accessToken}`

      const nextState = buildAuthenticatedState({
        ...nextAuth,
        user: nextUser,
      })
      setAuthState(nextState)

      return nextState
    } catch (error) {
      clearAuthTokens()
      delete authClient.defaults.headers.common.Authorization

      const message =
        error.response?.data?.message ?? error.message ?? 'Unable to log in with these credentials.'

      setAuthState(buildAnonymousState(message))

      throw error
    }
  }

  const logout = () => {
    clearAuthTokens()
    delete authClient.defaults.headers.common.Authorization
    setAuthState(buildAnonymousState())
  }

  const clearError = () => {
    setAuthState((currentState) => ({
      ...currentState,
      error: null,
    }))
  }

  const value = {
    ...authState,
    login,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
