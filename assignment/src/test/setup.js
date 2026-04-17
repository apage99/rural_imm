import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'
import { resetMockApiState } from '../mocks/browserMockApi'
import { clearAuthTokens } from '../auth/tokenStorage'

beforeEach(() => {
  clearAuthTokens()
  resetMockApiState()
})