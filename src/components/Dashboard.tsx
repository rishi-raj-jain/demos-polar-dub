import { useState, useEffect } from 'react'
import { TokenConfigForm } from './TokenConfigForm'
import { TokenConfigModal } from './TokenConfigModal'
import { CheckoutLinksTable } from './CheckoutLinksTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Github, Settings, RefreshCw, Loader2, AlertCircle, CheckCircle2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { APITokens, PolarCheckoutLink, CheckoutLinkWithShortUrl } from '@/types'
import { ShortUrlStorage } from '@/lib/shortUrlStorage'

export const Dashboard = () => {
  const [tokens, setTokens] = useState<APITokens | null>(null)
  const [checkoutLinks, setCheckoutLinks] = useState<CheckoutLinkWithShortUrl[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showTokenForm, setShowTokenForm] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load tokens from localStorage on mount
  useEffect(() => {
    const savedTokens = localStorage.getItem('polar-dub-tokens')
    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(savedTokens)
        setTokens(parsedTokens)
        setShowTokenForm(false)
      } catch (error) {
        console.error('Error parsing saved tokens:', error)
        localStorage.removeItem('polar-dub-tokens')
        setShowTokenForm(true)
      }
    } else {
      setShowTokenForm(true)
    }
    setIsInitialized(true)
  }, [])

  // Load checkout links when tokens are available
  useEffect(() => {
    if (tokens && !showTokenForm) {
      fetchCheckoutLinks()
    }
  }, [tokens, showTokenForm])

  const fetchCheckoutLinks = async () => {
    if (!tokens) return

    setIsLoading(true)
    try {
      const response = await fetch('https://api.polar.sh/v1/checkout-links/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokens.polarToken}`,
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch checkout links: ${response.statusText}`)
      }

      const data = await response.json()
      const links: CheckoutLinkWithShortUrl[] = data.items || []

      // Merge with persisted short URLs from localStorage
      const linksWithShortUrls = ShortUrlStorage.mergeWithShortUrls(links)

      // Count how many short URLs were restored from localStorage
      const restoredCount = linksWithShortUrls.filter((link) => link.shortUrl).length

      setCheckoutLinks(linksWithShortUrls)

      if (restoredCount > 0) {
        toast.success(`Loaded ${links.length} checkout links (${restoredCount} with short URLs restored)`)
      } else {
        toast.success(`Loaded ${links.length} checkout links`)
      }
    } catch (error) {
      console.error('Error fetching checkout links:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to fetch checkout links')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTokensSubmit = (newTokens: APITokens) => {
    setTokens(newTokens)
    setShowTokenForm(false)
  }

  const handleShortUrlCreate = (linkId: string, shortUrl: string) => {
    // Save to localStorage
    ShortUrlStorage.saveShortUrl(linkId, shortUrl)

    // Update component state
    setCheckoutLinks((prev) => prev.map((link) => (link.id === linkId ? { ...link, shortUrl } : link)))
  }

  const openSettings = () => {
    setShowTokenForm(true)
  }

  const closeSettings = () => {
    if (tokens) {
      setShowTokenForm(false)
    }
  }

  const resetConfiguration = () => {
    localStorage.removeItem('polar-dub-tokens')
    ShortUrlStorage.clearAllShortUrls()
    setTokens(null)
    setCheckoutLinks([])
    setShowTokenForm(true)
  }

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show token form if no tokens exist or settings is opened
  if (showTokenForm && !tokens) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <TokenConfigForm onTokensSubmit={handleTokensSubmit} initialTokens={tokens || undefined} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Polar × Dub Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Manage checkout links and create short URLs</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {checkoutLinks.length} links
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchCheckoutLinks} disabled={isLoading} className="transition-smooth">
                {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={openSettings} className="transition-smooth">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open('https://github.com/rishi-raj-jain/demos-polar-dub', '_blank')
                }}
                className="transition-smooth"
              >
                <Github className="w-4 h-4 mr-1" />
                Source Code
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Checkout Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{checkoutLinks.length}</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Short URLs Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{checkoutLinks.filter((link) => link.shortUrl).length}</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{checkoutLinks.filter((link) => !link.shortUrl).length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Links Table */}
          {isLoading ? (
            <Card className="shadow-medium">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Loading Checkout Links</h3>
                  <p className="text-muted-foreground">Fetching your checkout links from Polar...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <CheckoutLinksTable checkoutLinks={checkoutLinks} tokens={tokens} onShortUrlCreate={handleShortUrlCreate} />
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <TokenConfigModal isOpen={showTokenForm && !!tokens} onClose={closeSettings} onTokensSubmit={handleTokensSubmit} initialTokens={tokens || undefined} />
    </div>
  )
}
