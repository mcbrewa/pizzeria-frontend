export interface AuthUser {
  firstName: string
  email: string
}

export const useAuth = (): { user: AuthUser | null } => {
  return { user: null }
}
