import 'dotenv/config'
import cors from 'cors'
import express from 'express'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  }),
)
app.use(express.json())

// Proxy endpoint for Dub API - Create short link
app.post('/api/dub/links', async (req, res) => {
  try {
    const { url, title, dubToken } = req.body
    if (!url) return res.status(400).json({ error: 'URL is required' })
    if (!dubToken) return res.status(400).json({ error: 'Dub token is required' })
    const dubResponse = await fetch('https://api.dub.co/links', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        title: title || 'Polar Checkout',
      }),
    })
    if (!dubResponse.ok) {
      const errorText = await dubResponse.text()
      console.error('Dub API error:', errorText)
      return res.status(dubResponse.status).json({
        error: 'Failed to create short URL',
        details: errorText,
      })
    }
    const dubData = await dubResponse.json()
    res.json(dubData)
  } catch (error) {
    console.error('Error proxying Dub API:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    })
  }
})

// Proxy endpoint for Dub API - Get links (if needed in the future)
app.get('/api/dub/links', async (req, res) => {
  try {
    const { dubToken } = req.query
    if (!dubToken) return res.status(400).json({ error: 'Dub token is required' })
    const dubResponse = await fetch('https://api.dub.co/links', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${dubToken}`,
        'Content-Type': 'application/json',
      },
    })
    if (!dubResponse.ok) {
      const errorText = await dubResponse.text()
      console.error('Dub API error:', errorText)
      return res.status(dubResponse.status).json({
        error: 'Failed to fetch links',
        details: errorText,
      })
    }
    const dubData = await dubResponse.json()
    res.json(dubData)
  } catch (error) {
    console.error('Error proxying Dub API:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    })
  }
})

// Start server
app.listen(PORT, () => {})
