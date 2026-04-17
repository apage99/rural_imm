export function normalizeAuthPayload(data) {
  const payload = data?.data && typeof data.data === 'object' ? data.data : data
  const accessToken =
    payload?.APIToken ?? payload?.accessToken ?? payload?.token ?? payload?.access_token
  const refreshToken = payload?.refreshToken ?? payload?.refresh_token
  const user =
    payload?.user ??
    payload?.profile ??
    (payload?.userId || payload?.userType || payload?.email || payload?.isPasswordReset !== undefined
      ? {
          userId: payload?.userId ?? null,
          userType: payload?.userType ?? null,
          email: payload?.email ?? null,
          isPasswordReset: payload?.isPasswordReset ?? null,
        }
      : null)

  if (!accessToken) {
    throw new Error('Authentication response did not include an API token.')
  }

  return {
    accessToken,
    refreshToken,
    user,
  }
}