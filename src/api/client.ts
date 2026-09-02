const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';

// ISO 8601 date format regex (matches formats like 2026-09-02T11:42:34.000Z)
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dateReviver(key: string, value: any) {
  if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) {
    return new Date(value);
  }
  return value;
}

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

  // Read response as plain text and parse with the reviver function
  const text = await response.text()
  return text ? JSON.parse(text, dateReviver) as T : {} as T
}
