import authClient from './authClient'

export async function listDestinations({ page = 1, perPage = 4, search = '' } = {}) {
  const response = await authClient.get('/destinations', {
    params: { page, perPage, name: search },
  })

  return response.data
}

export async function createDestination(payload) {
  const response = await authClient.post('/destinations', payload)
  return response.data
}

export async function updateDestination(destinationId, payload) {
  const response = await authClient.put(`/destinations/${destinationId}`, payload)
  return response.data
}

export async function deleteDestination(destinationId) {
  await authClient.delete(`/destinations/${destinationId}`)
}