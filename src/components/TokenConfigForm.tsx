import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Key, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { APITokens } from '@/types'

interface TokenConfigFormProps {
  onTokensSubmit: (tokens: APITokens) => void
  initialTokens?: APITokens
}

export const TokenConfigForm = ({ onTokensSubmit, initialTokens }: TokenConfigFormProps) => {
  const [polarToken, setPolarToken] = useState(initialTokens?.polarToken || '')
  const [dubToken, setDubToken] = useState(initialTokens?.dubToken || '')
  const [showPolarToken, setShowPolarToken] = useState(false)
  const [showDubToken, setShowDubToken] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!polarToken.trim() || !dubToken.trim()) {
      toast.error('Please provide both tokens')
      return
    }

    if (!polarToken.startsWith('polar_oat_')) {
      toast.error("Polar token should start with 'polar_oat_'")
      return
    }

    if (!dubToken.startsWith('dub_')) {
      toast.error("Dub token should start with 'dub_'")
      return
    }

    const tokens: APITokens = { polarToken, dubToken }

    // Store in localStorage
    localStorage.setItem('polar-dub-tokens', JSON.stringify(tokens))

    onTokensSubmit(tokens)
    toast.success('Tokens configured successfully!')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-medium">
      <CardHeader className="text-center space-y-4">
        <div className="flex items-center justify-center w-16 h-16 mx-auto gradient-primary rounded-xl shadow-glow">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-semibold">API Configuration</CardTitle>
        <CardDescription className="text-base">Enter your Polar Organization Token and Dub API Key to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="polar-token" className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4" />
              Polar Organization Token
            </Label>
            <div className="relative">
              <Input
                id="polar-token"
                type={showPolarToken ? 'text' : 'password'}
                placeholder="polar_oat_xxxxxxxxxxxxxxxxx"
                value={polarToken}
                onChange={(e) => setPolarToken(e.target.value)}
                className="pr-10 h-11 transition-smooth focus:shadow-soft"
              />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-11 w-11 px-3" onClick={() => setShowPolarToken(!showPolarToken)}>
                {showPolarToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Get this from your Polar organization settings</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dub-token" className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4" />
              Dub API Key
            </Label>
            <div className="relative">
              <Input
                id="dub-token"
                type={showDubToken ? 'text' : 'password'}
                placeholder="dub_xxxxxx"
                value={dubToken}
                onChange={(e) => setDubToken(e.target.value)}
                className="pr-10 h-11 transition-smooth focus:shadow-soft"
              />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-11 w-11 px-3" onClick={() => setShowDubToken(!showDubToken)}>
                {showDubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Create this in your Dub workspace settings</p>
          </div>

          <Button type="submit" className="w-full h-11 gradient-primary shadow-medium hover:shadow-strong transition-spring text-white font-medium">
            Configure API Tokens
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
