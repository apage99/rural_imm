import authClient from './authClient'

function normalizeDestinationItem(destination) {
  const description = destination?.description?.trim() || ''
  const createdBy = destination?.createdBy?.trim() || ''

  return {
    ...destination,
    id: destination?.id,
    name: destination?.name ?? destination?.destinationName ?? '',
    region:
      destination?.region ??
      destination?.state ??
      destination?.district ??
      destination?.taluka ??
      (createdBy ? `Created by ${createdBy}` : 'Region unavailable'),
    hostCommunity:
      destination?.hostCommunity ??
      destination?.community ??
      destination?.village ??
      createdBy ??
      'Community unavailable',
    description: description || (createdBy ? `Created by ${createdBy}.` : 'Description unavailable.'),
  }
}

function normalizeDestinationsResponse(data, { page, perPage }) {
  const payload = data?.data && typeof data.data === 'object' ? data.data : data
  const destinations = payload?.destinations ?? payload?.items ?? payload?.data ?? []
  const metadata = payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}
  const totalValue =
    metadata.total ?? metadata.totalCount ?? metadata.count ?? metadata.totalItems ?? destinations.length
  const totalItems = Number.isNaN(Number(totalValue)) ? destinations.length : Number(totalValue)
  const safePage = Number(metadata.page ?? page)
  const safePerPage = Number(metadata.perPage ?? perPage)
  const totalPages = Math.max(1, Math.ceil(totalItems / safePerPage))

  return {
    items: Array.isArray(destinations) ? destinations.map(normalizeDestinationItem) : [],
    meta: {
      page: safePage,
      perPage: safePerPage,
      totalItems,
      totalPages,
    },
  }
}

export async function listDestinations({ page = 1, perPage = 4, search = '' } = {}) {
  const response = await authClient.get('/admin/destinations', {
    params: { page, perPage, name: search },
  })

  return normalizeDestinationsResponse(response.data, { page, perPage })
}

export async function createDestination(payload) {
  const response = await authClient.post('/admin/create-destination', payload)
  return response.data
}

export async function updateDestination(destinationId, payload) {
  const response = await authClient.put(`/admin/update-destination/${destinationId}`, payload)
  return response.data
}

export async function deleteDestination(destinationId) {
  await authClient.delete(`/admin/delete-destination/${destinationId}`)
}