import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import authClient from '../api/authClient'

const MOCK_CREDENTIALS = {
  email: 'manager@ruralimmersion.com',
  password: 'Password123!',
}

const MOCK_USER = {
  id: 'user-1',
  name: 'Rural Operations Manager',
  email: MOCK_CREDENTIALS.email,
}

const seededDestinations = [
  {
    id: 'dest-1',
    name: 'Araku Valley Coffee Trail',
    region: 'Andhra Pradesh',
    hostCommunity: 'Padmapuram Cooperative',
    description: 'Immersive farm stays, coffee processing tours, and tribal artisan workshops.',
  },
  {
    id: 'dest-2',
    name: 'Sundarbans River Hamlet',
    region: 'West Bengal',
    hostCommunity: 'Dayapur Eco Network',
    description: 'Mangrove exploration, homestays, and climate-resilient livelihood experiences.',
  },
  {
    id: 'dest-3',
    name: 'Coorg Spice Highlands',
    region: 'Karnataka',
    hostCommunity: 'Kodagu Women Producers Guild',
    description: 'Pepper trails, spice drying demos, and community-led culinary immersion.',
  },
  {
    id: 'dest-4',
    name: 'Majuli Island Crafts Circuit',
    region: 'Assam',
    hostCommunity: 'Brahmaputra Artisan Collective',
    description: 'Satra visits, mask-making, and river-island cultural immersion.',
  },
  {
    id: 'dest-5',
    name: 'Kutch Desert Artisan Route',
    region: 'Gujarat',
    hostCommunity: 'Banni Embroidery Cluster',
    description: 'Textile workshops, salt desert trails, and regenerative tourism stays.',
  },
  {
    id: 'dest-6',
    name: 'Wayanad Forest Learning Camp',
    region: 'Kerala',
    hostCommunity: 'Paniya Green Guides',
    description: 'Agroforestry walks, indigenous storytelling, and conservation education.',
  },
]

let httpMock = null
let authMock = null
let destinations = []
let accessTokenVersion = 0
let activeAccessToken = ''
let activeRefreshToken = ''
let serverSessionVersion = 0
let nextDeleteFailureMessage = null

function parseBody(data) {
  if (!data) {
    return {}
  }

  if (typeof data === 'string') {
    return JSON.parse(data)
  }

  return data
}

function issueTokens() {
  accessTokenVersion += 1
  activeAccessToken = `mock-api-token-${accessTokenVersion}`
  activeRefreshToken = `mock-refresh-token-${accessTokenVersion}`
  serverSessionVersion += 1

  return {
    APIToken: activeAccessToken,
    refreshToken: activeRefreshToken,
    user: MOCK_USER,
  }
}

function validateDestination(payload) {
  const errors = {}

  if (!payload.name?.trim()) {
    errors.name = 'Destination name is required.'
  }

  if (!payload.region?.trim()) {
    errors.region = 'Region is required.'
  }

  if (!payload.hostCommunity?.trim()) {
    errors.hostCommunity = 'Host community is required.'
  }

  if (!payload.description?.trim() || payload.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters.'
  }

  return errors
}

function isAuthorized(config) {
  const header = config.headers?.Authorization ?? config.headers?.authorization
  return header === `Bearer ${activeAccessToken}`
}

function unauthorizedResponse() {
  return [401, { message: 'Unauthorized request.' }]
}

function paginate(items, page, perPage) {
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const startIndex = (safePage - 1) * perPage

  return {
    items: items.slice(startIndex, startIndex + perPage),
    meta: {
      page: safePage,
      perPage,
      totalItems,
      totalPages,
    },
  }
}

function resetState() {
  destinations = seededDestinations.map((destination) => ({ ...destination }))
  accessTokenVersion = 0
  serverSessionVersion = 0
  nextDeleteFailureMessage = null
  issueTokens()
}

function registerHandlers() {
  httpMock.onPost(/\/auth\/login$/).reply((config) => {
    const payload = parseBody(config.data)

    if (
      payload.email !== MOCK_CREDENTIALS.email ||
      payload.password !== MOCK_CREDENTIALS.password
    ) {
      return [401, { message: 'Incorrect email or password.' }]
    }

    return [200, issueTokens()]
  })

  httpMock.onPost(/\/auth\/refresh$/).reply((config) => {
    const payload = parseBody(config.data)

    if (payload.refreshToken !== activeRefreshToken) {
      return [401, { message: 'Refresh token is no longer valid.' }]
    }

    return [200, issueTokens()]
  })

  authMock.onGet(/\/admin\/destinations$/).reply((config) => {
    if (!isAuthorized(config)) {
      return unauthorizedResponse()
    }

    const page = Number(config.params?.page ?? 1)
    const perPage = Number(config.params?.perPage ?? 4)
    const searchTerm = (config.params?.name ?? '').toLowerCase().trim()
    const filteredItems = searchTerm
      ? destinations.filter((destination) => destination.name.toLowerCase().includes(searchTerm))
      : destinations

    const paginated = paginate(filteredItems, page, perPage)
    return [200, { destinations: paginated.items, metadata: { ...paginated.meta, total: paginated.meta.totalItems } }]
  })

  authMock.onPost(/\/admin\/create-destination$/).reply((config) => {
    if (!isAuthorized(config)) {
      return unauthorizedResponse()
    }

    const payload = parseBody(config.data)
    const errors = validateDestination(payload)

    if (Object.keys(errors).length > 0) {
      return [422, { message: 'Destination payload failed validation.', errors }]
    }

    const destination = {
      id: `dest-${Date.now()}`,
      name: payload.name.trim(),
      region: payload.region.trim(),
      hostCommunity: payload.hostCommunity.trim(),
      description: payload.description.trim(),
    }

    destinations = [destination, ...destinations]
    return [201, destination]
  })

  authMock.onPut(/\/admin\/update-destination\/[^/]+$/).reply((config) => {
    if (!isAuthorized(config)) {
      return unauthorizedResponse()
    }

    const payload = parseBody(config.data)
    const destinationId = config.url.split('/').pop()
    const errors = validateDestination(payload)

    if (Object.keys(errors).length > 0) {
      return [422, { message: 'Destination payload failed validation.', errors }]
    }

    destinations = destinations.map((destination) =>
      destination.id === destinationId
        ? {
            ...destination,
            name: payload.name.trim(),
            region: payload.region.trim(),
            hostCommunity: payload.hostCommunity.trim(),
            description: payload.description.trim(),
          }
        : destination,
    )

    return [200, destinations.find((destination) => destination.id === destinationId)]
  })

  authMock.onDelete(/\/admin\/delete-destination\/[^/]+$/).reply((config) => {
    if (!isAuthorized(config)) {
      return unauthorizedResponse()
    }

    if (nextDeleteFailureMessage) {
      const message = nextDeleteFailureMessage
      nextDeleteFailureMessage = null
      return [500, { message }]
    }

    const destinationId = config.url.split('/').pop()
    destinations = destinations.filter((destination) => destination.id !== destinationId)
    return [204]
  })
}

function shouldEnableMockApi() {
  return (
    import.meta.env.VITE_ENABLE_MOCK_API === 'true' ||
    (!import.meta.env.VITE_API_DOMAIN && (import.meta.env.DEV || import.meta.env.MODE === 'test'))
  )
}

export function resetMockApiState() {
  resetState()
}

export function invalidateMockSession({ refreshFails = false } = {}) {
  activeAccessToken = `server-expired-token-${serverSessionVersion + 1}`

  if (refreshFails) {
    activeRefreshToken = `server-expired-refresh-${serverSessionVersion + 1}`
  }
}

export function failNextDeleteRequest(message = 'Unable to delete destination.') {
  nextDeleteFailureMessage = message
}

export function ensureMockApi() {
  if (!shouldEnableMockApi()) {
    return false
  }

  if (!httpMock || !authMock) {
    httpMock = new AxiosMockAdapter(axios, { delayResponse: 150 })
    authMock = new AxiosMockAdapter(authClient, { delayResponse: 150 })
    registerHandlers()
  }

  resetState()
  return true
}

ensureMockApi()