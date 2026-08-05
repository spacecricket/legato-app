const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';

export async function apiFetch<T = Response>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  // Handle empty responses (like 204 No Content) safely
  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>;
}
