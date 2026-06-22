import { useAuthContext } from '#/contexts/AuthContext'
import type { AuthPermission, AuthRole, AuthUser } from '#/types/auth'

export type { AuthUser, AuthRole, AuthPermission }

export const useAuth = () => useAuthContext()
