export interface AuthPermission {
  slug: string
}

export interface AuthRole {
  slug: string
  permissions: Array<AuthPermission>
}

export interface AuthUser {
  id: string
  firstName: string
  email: string
  organisationId: string
  roles: Array<AuthRole>
}

export interface ServerAuthState {
  user: AuthUser
  accessToken: string
}
