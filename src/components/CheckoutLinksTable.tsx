import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExternalLink, Link, Copy, Loader2, Calendar, Package } from 'lucide-react'
import { toast } from 'sonner'
import { CheckoutLinkWithShortUrl, APITokens } from '@/types'
import { getApiUrl } from '@/lib/api'

interface CheckoutLinksTableProps {
  checkoutLinks: CheckoutLinkWithShortUrl[]
  tokens: APITokens
  onShortUrlCreate: (linkId: string, shortUrl: string) => void
}

export const CheckoutLinksTable = ({ checkoutLinks, tokens, onShortUrlCreate }: CheckoutLinksTableProps) => {
  const [creatingShortUrls, setCreatingShortUrls] = useState<Set<string>>(new Set())

  const createShortUrl = async (checkoutLink: CheckoutLinkWithShortUrl) => {
    if (creatingShortUrls.has(checkoutLink.id)) return

    setCreatingShortUrls((prev) => new Set([...prev, checkoutLink.id]))

    try {
      const response = await fetch(getApiUrl('dub/links'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: checkoutLink.url,
          title: checkoutLink.label || checkoutLink.product?.name || 'Polar Checkout',
          dubToken: tokens.dubToken,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Failed to create short URL: ${error.details || error.error}`)
      }

      const dubResponse = await response.json()
      onShortUrlCreate(checkoutLink.id, dubResponse.shortLink)
      toast.success('Short URL created successfully!')
    } catch (error) {
      console.error('Error creating short URL:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create short URL')
    } finally {
      setCreatingShortUrls((prev) => {
        const newSet = new Set(prev)
        newSet.delete(checkoutLink.id)
        return newSet
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (checkoutLinks.length === 0) {
    return (
      <Card className="w-full shadow-medium">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No checkout links found</h3>
          <p className="text-muted-foreground max-w-md">Your Polar organization doesn't have any checkout links yet. Create some in your Polar dashboard to see them here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5" />
          Checkout Links
        </CardTitle>
        <CardDescription>Manage your Polar checkout links and create short URLs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Checkout Link</TableHead>
                <TableHead className="font-semibold">Short URL</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkoutLinks.map((link) => (
                <TableRow key={link.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div className="font-medium">{link.product?.name || link.label || 'Unnamed Product'}</div>
                      {link.product?.description && <div className="text-sm text-muted-foreground line-clamp-2">{link.product.description}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-xs">
                      <div className="truncate text-sm font-mono bg-muted/50 px-2 py-1 rounded">{link.url}</div>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(link.url)} className="h-7 w-7 p-0">
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => window.open(link.url, '_blank')} className="h-7 w-7 p-0">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {link.shortUrl ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {link.shortUrl}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(link.shortUrl!)} className="h-7 w-7 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => window.open(link.shortUrl!, '_blank')} className="h-7 w-7 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => createShortUrl(link)} disabled={creatingShortUrls.has(link.id)} size="sm" variant="outline" className="h-8">
                        {creatingShortUrls.has(link.id) ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Link className="w-3 h-3 mr-2" />
                            Create Short URL
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(link.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => window.open(link.url, '_blank')} className="h-8">
                      <ExternalLink className="w-3 h-3 mr-2" />
                      Visit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
