/**
 * Get the base API URL based on environment
 */
export function getApiBaseUrl(): string {
  // In production (Vercel), use the same domain
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return ''
  }

  // In development, use localhost backend
  return 'http://localhost:3001'
}

/**
 * Get the full API URL for a given endpoint
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl()
  return `${baseUrl}/api/${endpoint}`
}

/**
 * Environment detection utilities
 */
export const isDevelopment = () => {
  return typeof window !== 'undefined' && window.location.hostname === 'localhost'
}

export const isProduction = () => {
  return !isDevelopment()
}
