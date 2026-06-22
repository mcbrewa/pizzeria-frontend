import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authClient, setAccessToken } from '#/api/client'
import type { AuthUser, ServerAuthState } from '#/types/auth'

export type { AuthUser }

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (slug: string) => boolean
  hasRole: (slug: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}

const PIZZERIA_ORG_ID = import.meta.env.VITE_PIZZERIA_ORG_ID as string

const extractProfile = (data: unknown): AuthUser => {
  const d = data as Record<string, unknown>
  const raw = ((d?.data ?? d) as Partial<AuthUser>)
  return {
    id: raw.id ?? '',
    firstName: raw.firstName ?? '',
    email: raw.email ?? '',
    organisationId: raw.organisationId ?? '',
    roles: raw.roles ?? [],
  }
}

const assertPizzeriaOrg = (organisationId: string) => {
  const isPizzeriaOrgConfigured = Boolean(PIZZERIA_ORG_ID)
  if (!isPizzeriaOrgConfigured) return
  const isWrongOrg = organisationId !== PIZZERIA_ORG_ID
  if (isWrongOrg) throw new Error('To konto nie należy do organizacji Pizzeria.')
}

interface AuthProviderProps {
  children: ReactNode
  initialAuthState?: ServerAuthState | null
}

export const AuthProvider = ({ children, initialAuthState }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (!initialAuthState) return null
    setAccessToken(initialAuthState.accessToken)
    return initialAuthState.user
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleForcedLogout = () => {
      setAccessToken(null)
      setUser(null)
    }
    window.addEventListener('auth:forced-logout', handleForcedLogout)
    return () => window.removeEventListener('auth:forced-logout', handleForcedLogout)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    try {
      const res = await authClient.post('/auth/login', { email, password })
      const token = (res.data?.data?.accessToken ?? res.data?.accessToken) as string
      setAccessToken(token)
      const profileRes = await authClient.get('/users/profile')
      const profile = extractProfile(profileRes.data)
      assertPizzeriaOrg(profile.organisationId)
      setUser(profile)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      await authClient.post('/auth/logout').catch(() => {})
    } finally {
      setAccessToken(null)
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  const { permissionSlugs, roleSlugs } = useMemo(() => {
    if (!user) return { permissionSlugs: new Set<string>(), roleSlugs: new Set<string>() }
    return {
      permissionSlugs: new Set(user.roles.flatMap((r) => r.permissions.map((p) => p.slug))),
      roleSlugs: new Set(user.roles.map((r) => r.slug)),
    }
  }, [user])

  const hasPermission = useCallback((slug: string) => permissionSlugs.has(slug), [permissionSlugs])
  const hasRole = useCallback((slug: string) => roleSlugs.has(slug), [roleSlugs])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isInitialized: true,
      login,
      logout,
      hasPermission,
      hasRole,
    }),
    [user, isLoading, login, logout, hasPermission, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
