import React, { useState, useEffect } from 'react';
import { ExternalLink, Facebook } from 'lucide-react';

const NOTOVenuesEmbed = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [venueTypes, setVenueTypes] = useState([]);

  const trackEvent = (eventType, venueId, venueName, action = '') => {
    const event = {
      type: eventType,
      venueId,
      venueName,
      action,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(err => console.error('Analytics error:', err));
  };

useEffect(() => {
  const fetchVenues = async () => {
    try {
      const apiBase = window.location.hostname === 'localhost' 
        ? '' 
        : 'https://noto-venues-embed.vercel.app';
      
      console.log('Fetching from:', `${apiBase}/api/venues`);
      const response = await fetch(`${apiBase}/api/venues`);

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch venues: ${response.status}`);
      }

      const data = await response.json();
      console.log('Venues data:', data);
setVenues(data.venues);

// Extract and split venue types (handles multiple types per venue)
const allTypes = data.venues
  .flatMap(v => {
    if (!v.venueType) return [];
    // Split by comma (from multi-select join)
    return v.venueType
      .split(',')
      .map(type => type.trim())
      .filter(type => type.length > 0);
  });

// Get unique types and sort alphabetically
const uniqueTypes = [...new Set(allTypes)].sort();
setVenueTypes(uniqueTypes);

        trackEvent('embed_view', null, null);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const filteredVenues = selectedFilter === 'all' 
  ? venues 
  : venues.filter(v => {
      if (!v.venueType) return false;
      // Check if venue type contains the selected filter
      const types = v.venueType.split(',').map(t => t.trim());
      return types.includes(selectedFilter);
    });

  const handleClick = (venueId, venueName, action) => {
    trackEvent('click', venueId, venueName, action);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600" style={{ fontFamily: 'Droid Sans, sans-serif' }}>
          Loading venues...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded" style={{ fontFamily: 'Droid Sans, sans-serif' }}>
        Error loading venues: {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Droid+Sans:wght@400;700&display=swap');
        
        .venue-card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .venue-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      `}</style>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedFilter === 'all'
              ? 'bg-[#a4185e] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          style={{ fontFamily: 'Droid Sans, sans-serif' }}
        >
          All Venues
        </button>
        {venueTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === type
                ? 'bg-[#a4185e] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            style={{ fontFamily: 'Droid Sans, sans-serif' }}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredVenues.map(venue => (
          <div
            key={venue.id}
            className={`venue-card-hover rounded-lg shadow-md overflow-hidden ${
              venue.friendsOfNOTO ? 'bg-[#a4185e]' : 'bg-white'
            }`}
          >
            {venue.venueLogo && (
              <div className={`h-48 ${venue.friendsOfNOTO ? 'bg-[#8a1450]' : 'bg-gray-100'} flex items-center justify-center`}>
                <img
                  src={venue.venueLogo}
                  alt={venue.venueName}
                  className="max-h-full max-w-full object-contain p-4"
                />
              </div>
            )}

            <div className="p-5">
              <h3
                className={`text-xl font-bold mb-2 ${
                  venue.friendsOfNOTO ? 'text-white' : 'text-gray-900'
                }`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {venue.venueName}
              </h3>

              {venue.address && (
                <p
                  className={`text-sm mb-2 ${
                    venue.friendsOfNOTO ? 'text-white' : 'text-gray-600'
                  }`}
                  style={{ fontFamily: 'Droid Sans, sans-serif' }}
                >
                  {venue.address}
                </p>
              )}

              {venue.phone && (
                <p
                  className={`text-sm mb-3 ${
                    venue.friendsOfNOTO ? 'text-white' : 'text-gray-600'
                  }`}
                  style={{ fontFamily: 'Droid Sans, sans-serif' }}
                >
                  {venue.phone}
                </p>
              )}

              {venue.numberEvents > 0 && venue.slug && (
                <a
                  href={`https://785mag.com/venues/${venue.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleClick(venue.id, venue.venueName, 'events')}
                  className={`inline-block w-full text-center px-4 py-2 rounded mb-3 text-sm font-medium transition-colors ${
                    venue.friendsOfNOTO
                      ? 'bg-white text-[#a4185e] hover:bg-gray-100'
                      : 'bg-[#a4185e] text-white hover:bg-[#8a1450]'
                  }`}
                  style={{ fontFamily: 'Droid Sans, sans-serif' }}
                >
                  {venue.numberEvents} Upcoming Event{venue.numberEvents !== 1 ? 's' : ''}
                </a>
              )}

              <div className="flex gap-3 justify-center">
                {venue.website && (
                  <a
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleClick(venue.id, venue.venueName, 'website')}
                    className={`p-2 rounded-full transition-colors ${
                      venue.friendsOfNOTO
                        ? 'bg-white text-[#a4185e] hover:bg-gray-100'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-label="Visit website"
                  >
                    <ExternalLink size={20} />
                  </a>
                )}
                {venue.facebook && (
                  <a
                    href={venue.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleClick(venue.id, venue.venueName, 'facebook')}
                    className={`p-2 rounded-full transition-colors ${
                      venue.friendsOfNOTO
                        ? 'bg-white text-[#a4185e] hover:bg-gray-100'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-label="Visit Facebook page"
                  >
                    <Facebook size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-6 border-t border-gray-200">
        <p className="text-sm text-gray-600" style={{ fontFamily: 'Droid Sans, sans-serif' }}>
          Events and Directory presented by <span className="font-bold">seveneightfive magazine</span> in partnership with <span className="font-bold">ArtsConnect</span>.{' '}
          <a
            href="https://785mag.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#a4185e] hover:underline font-medium"
            onClick={() => handleClick(null, null, 'footer_link')}
          >
            Get more Topeka events here.
          </a>
        </p>
      </div>
    </div>
  );
};

export default NOTOVenuesEmbed;
