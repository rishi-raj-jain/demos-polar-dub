export interface PolarCheckoutLink {
  id: string
  url: string
  label?: string
  product?: {
    id: string
    name: string
    description?: string
  }
  created_at: string
  updated_at: string
}

export interface DubLinkResponse {
  id: string
  domain: string
  key: string
  url: string
  shortLink: string
  createdAt: string
}

export interface APITokens {
  polarToken: string
  dubToken: string
}

export interface CheckoutLinkWithShortUrl extends PolarCheckoutLink {
  shortUrl?: string
  isCreatingShortUrl?: boolean
}
