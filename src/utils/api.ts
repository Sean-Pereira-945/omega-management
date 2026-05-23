const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const apiUrl = (path: string) => `${API_BASE}${path}`

export const apiFetch = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'Request failed'
    try {
      const data = await response.json()
      message = data?.message ?? message
    } catch {
      message = response.statusText || message
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}
