import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Key, Shield, X } from 'lucide-react'
import { toast } from 'sonner'
import { APITokens } from '@/types'

interface TokenConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onTokensSubmit: (tokens: APITokens) => void
  initialTokens?: APITokens
}

export const TokenConfigModal = ({ isOpen, onClose, onTokensSubmit, initialTokens }: TokenConfigModalProps) => {
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
    onClose()
  }

  const resetTokens = () => {
    localStorage.removeItem('polar-dub-tokens')
    setPolarToken('')
    setDubToken('')
    toast.success('Tokens cleared')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 gradient-primary rounded-lg shadow-glow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle>API Configuration</DialogTitle>
                <DialogDescription>Configure your Polar and Dub API tokens</DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="pr-10"
              />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-10 w-10 px-3" onClick={() => setShowPolarToken(!showPolarToken)}>
                {showPolarToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
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
                className="pr-10"
              />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-10 w-10 px-3" onClick={() => setShowDubToken(!showDubToken)}>
                {showDubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Save Configuration
            </Button>
            {initialTokens && (
              <Button type="button" variant="outline" onClick={resetTokens} className="flex-1">
                Clear Tokens
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
