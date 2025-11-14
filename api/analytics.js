export default async function handler(req, res) {
  const allowedOrigins = [
    'https://785mag.com',
    'https://www.785mag.com',
    'https://785design.com',
    'https://notoartsdistrict.com',
    'http://localhost:3000',
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;

    if (!event.type || !event.timestamp) {
      return res.status(400).json({ error: 'Invalid event data' });
    }

    await fetch('https://app.posthog.com/capture/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: process.env.POSTHOG_API_KEY,
        event: event.type,
        properties: {
          venueId: event.venueId,
          venueName: event.venueName,
          action: event.action,
          url: event.url,
          timestamp: event.timestamp,
          $lib: 'noto-venues-embed',
          $lib_version: '1.0.0'
        },
        timestamp: event.timestamp
      })
    });

    console.log('Analytics event tracked:', event.type);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error tracking analytics:', error);
    return res.status(500).json({ error: 'Failed to track event' });
  }
}
