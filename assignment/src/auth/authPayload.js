export function normalizeAuthPayload(data) {
  const accessToken =
    data?.APIToken ?? data?.accessToken ?? data?.token ?? data?.access_token
  const refreshToken = data?.refreshToken ?? data?.refresh_token
  const user = data?.user ?? data?.profile ?? null

  if (!accessToken) {
    throw new Error('Authentication response did not include an API token.')
  }

  return {
    accessToken,
    refreshToken,
    user,
  }
}