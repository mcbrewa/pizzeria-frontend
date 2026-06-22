import axios, { type AxiosInstance } from 'axios'

let accessToken: string | null = null

export const getAccessToken = () => accessToken

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const authClient = axios.create({
  baseURL: '/api-auth',
  withCredentials: true,
})

export const pizzeriaClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

const attachToken = (client: AxiosInstance) => {
  client.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    return config
  })
}

attachToken(authClient)
attachToken(pizzeriaClient)

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

const processQueue = (token: string | null) => {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

const doTokenRefresh = async (): Promise<string> => {
  const res = await fetch('/api-auth/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Refresh failed')
  const data = (await res.json()) as { data?: { accessToken?: string } }
  const token = data.data?.accessToken
  if (!token) throw new Error('No token in refresh response')
  setAccessToken(token)
  return token
}

const setupAuthInterceptor = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      const is401 = error.response?.status === 401
      const isRefreshUrl = (originalRequest.url as string)?.includes('/auth/refresh')

      if (!is401 || isRefreshUrl || originalRequest._retry) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token) { reject(error); return }
            originalRequest.headers.Authorization = `Bearer ${token}`
            originalRequest._retry = true
            resolve(client(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const token = await doTokenRefresh()
        processQueue(token)
        originalRequest.headers.Authorization = `Bearer ${token}`
        return client(originalRequest)
      } catch {
        processQueue(null)
        setAccessToken(null)
        window.dispatchEvent(new Event('auth:forced-logout'))
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    },
  )
}

setupAuthInterceptor(authClient)
setupAuthInterceptor(pizzeriaClient)
