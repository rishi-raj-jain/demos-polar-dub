export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  // Only allow POST requests
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
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
    res.status(200).json(dubData)
  } catch (error) {
    console.error('Error proxying Dub API:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    })
  }
}
