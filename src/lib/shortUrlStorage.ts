import { CheckoutLinkWithShortUrl } from '@/types'

const STORAGE_KEY = 'polar-dub-short-urls'

export interface ShortUrlMapping {
  [linkId: string]: string // linkId -> shortUrl
}

export class ShortUrlStorage {
  /**
   * Save short URL mapping to localStorage
   */
  static saveShortUrl(linkId: string, shortUrl: string): void {
    try {
      const existing = this.getAllShortUrls()
      existing[linkId] = shortUrl
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    } catch (error) {
      console.error('Error saving short URL to localStorage:', error)
    }
  }

  /**
   * Get all short URL mappings from localStorage
   */
  static getAllShortUrls(): ShortUrlMapping {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error reading short URLs from localStorage:', error)
      return {}
    }
  }

  /**
   * Get short URL for a specific link ID
   */
  static getShortUrl(linkId: string): string | null {
    const mappings = this.getAllShortUrls()
    return mappings[linkId] || null
  }

  /**
   * Remove short URL for a specific link ID
   */
  static removeShortUrl(linkId: string): void {
    try {
      const existing = this.getAllShortUrls()
      delete existing[linkId]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    } catch (error) {
      console.error('Error removing short URL from localStorage:', error)
    }
  }

  /**
   * Clear all short URL mappings
   */
  static clearAllShortUrls(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing short URLs from localStorage:', error)
    }
  }

  /**
   * Merge checkout links with persisted short URLs
   */
  static mergeWithShortUrls(checkoutLinks: CheckoutLinkWithShortUrl[]): CheckoutLinkWithShortUrl[] {
    const shortUrlMappings = this.getAllShortUrls()

    return checkoutLinks.map((link) => ({
      ...link,
      shortUrl: shortUrlMappings[link.id] || link.shortUrl,
    }))
  }

  /**
   * Get statistics about stored short URLs
   */
  static getStats(): { total: number; used: number; available: number } {
    const mappings = this.getAllShortUrls()
    const total = Object.keys(mappings).length

    return {
      total,
      used: total,
      available: 0, // This would need to be calculated based on total checkout links
    }
  }
}
