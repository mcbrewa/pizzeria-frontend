import { createServerFn } from '@tanstack/react-start'
import { getRequest, setResponseHeader } from '@tanstack/react-start/server'
import type { AuthUser, ServerAuthState } from '#/types/auth'

const AUTH_API_BASE = process.env.SERVER_AUTH_API_URL ?? 'http://localhost:5000/api'
const PIZZERIA_ORG_ID = process.env.VITE_PIZZERIA_ORG_ID

export const getServerAuthState = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ServerAuthState | null> => {
    const request = getRequest()
    const cookieHeader = request.headers.get('cookie') ?? ''

    if (!cookieHeader) return null

    try {
      const refreshRes = await fetch(`${AUTH_API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
      })

      if (!refreshRes.ok) return null

      const setCookieHeaders = refreshRes.headers.getSetCookie()
      if (setCookieHeaders.length > 0) {
        setResponseHeader('Set-Cookie', setCookieHeaders)
      }

      const refreshData = (await refreshRes.json()) as { data?: { accessToken?: string } }
      const accessToken = refreshData.data?.accessToken

      if (!accessToken) return null

      const profileRes = await fetch(`${AUTH_API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!profileRes.ok) return null

      const profileData = (await profileRes.json()) as { data?: AuthUser }
      const user = profileData.data

      if (!user) return null

      const isPizzeriaOrgConfigured = Boolean(PIZZERIA_ORG_ID)
      if (isPizzeriaOrgConfigured && user.organisationId !== PIZZERIA_ORG_ID) return null

      console.log('[SSR] getServerAuthState called')

      console.log('[SSR] user:', user.email)

      return { user, accessToken }
    } catch {
      return null
    }
  },
)


