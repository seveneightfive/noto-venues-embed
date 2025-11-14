export default async function handler(req, res) {
  // Enable CORS for your domains
  const allowedOrigins = [
    'https://785mag.com',
    'https://www.785mag.com',
    'https://www.785design.com',
    'https://notoartsdistrict.com',
    'http://localhost:3000',
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      'https://api.airtable.com/v0/appyRFnhiBoMRNQjB/Venues?view=NOTO',
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();

    const venues = data.records.map(record => ({
      id: record.id,
      venueLogo: record.fields['venueLogo']?.[0]?.url || '',
      venueName: record.fields['venueName'] || '',
      numberEvents: record.fields['NumberEvents'] || 0,
      address: record.fields['NOTO Address'] || '',
      website: record.fields['website'] || '',
      facebook: record.fields['facebook'] || '',
      phone: record.fields['Phone Number'] || '',
      friendsOfNOTO: record.fields['Friends of NOTO'] || false,
      venueType: record.fields['venueType'] || '',
      slug: record.fields['slug'] || ''
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

    return res.status(200).json({ venues });

  } catch (error) {
    console.error('Error fetching venues:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch venues',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
