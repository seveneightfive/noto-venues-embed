import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Facebook, Calendar } from 'lucide-react';

const NOTOVenuesEmbed = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [venueTypes, setVenueTypes] = useState([]);

  const trackEvent = useCallback((eventType, venueId, venueName, action = '') => {
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
  }, []);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch('https://noto-venues-embed.vercel.app/api/venues');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.venues || data.venues.length === 0) {
          throw new Error('No venues found in response');
        }

        setVenues(data.venues);

        const allTypes = [];
        data.venues.forEach(venue => {
          if (venue.venueType) {
            const types = venue.venueType.split(',').map(t => t.trim());
            types.forEach(type => {
              if (type && !allTypes.includes(type)) {
                allTypes.push(type);
              }
            });
          }
        });

        allTypes.sort();
        setVenueTypes(allTypes);
        setLoading(false);

        trackEvent('embed_view', null, null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVenues();
  }, [trackEvent]);

  useEffect(() => {
    if (window.self !== window.top) {
      const sendHeight = () => {
        const height = document.body.scrollHeight;
        window.parent.postMessage({ height }, '*');
      };
      
      setTimeout(sendHeight, 100);
      
      window.addEventListener('resize', sendHeight);
      
      return () => window.removeEventListener('resize', sendHeight);
    }
  }, [venues]);

  const filteredVenues = selectedFilter === 'all' 
    ? venues 
    : venues.filter(v => {
        if (!v.venueType) return false;
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {filteredVenues.map(venue => {
          const hasImageUrl = venue.imageUrl && venue.imageUrl.trim() !== '';
          const hasUpcomingEvents = venue.NumberEvents && venue.NumberEvents >= 1;
          
          return (
            <div
              key={venue.id}
              className={`venue-card-hover rounded-lg shadow-md overflow-hidden ${
                venue.friendsOfNOTO ? 'bg-[#a4185e]' : 'bg-white'
              }`}
            >
              <div className={`h-64 relative ${venue.friendsOfNOTO ? 'bg-gray-200' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                {hasImageUrl ? (
                  <>
                    <img
                      src={venue.imageUrl}
                      alt={venue.venueName}
                      className="w-full h-full object-cover"
                    />
                    {venue.venueLogo && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                          <img
                            src={venue.venueLogo}
                            alt={`${venue.venueName} logo`}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : venue.venueLogo ? (
                  <img
                    src={venue.venueLogo}
                    alt={venue.venueName}
                    className="max-h-full max-w-full object-contain p-6"
                  />
                ) : null}
              </div>

              <div className={`p-5 ${hasImageUrl && venue.venueLogo ? 'pt-8' : ''}`}>
                <h3
                  className={`text-xl font-bold mb-1 text-center ${
                    venue.friendsOfNOTO ? 'text-white' : 'text-gray-900'
                  }`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {venue.venueName}
                </h3>

                {venue.venueType && (
                  <p
                    className={`text-sm mb-3 text-center ${
                      venue.friendsOfNOTO ? 'text-white opacity-90' : 'text-gray-600'
                    }`}
                    style={{ fontFamily: 'Droid Sans, sans-serif' }}
                  >
                    {venue.venueType.split(',')[0].trim()}
                  </p>
                )}

                {venue.address && (
                  <p
                    className={`text-sm mb-2 flex items-start gap-1 ${
                      venue.friendsOfNOTO ? 'text-white' : 'text-gray-600'
                    }`}
                    style={{ fontFamily: 'Droid Sans, sans-serif' }}
                  >
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {venue.address}
                  </p>
                )}

                {venue.phone && (
                  <p
                    className={`text-sm mb-4 flex items-center gap-1 ${
                      venue.friendsOfNOTO ? 'text-white' : 'text-gray-600'
                    }`}
                    style={{ fontFamily: 'Droid Sans, sans-serif' }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {venue.phone}
                  </p>
                )}

                {hasUpcomingEvents && venue.slug && (
                  <a
                    href={`https://785mag.com/venues/${venue.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleClick(venue.id, venue.venueName, 'events')}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors mb-2 ${
                      venue.friendsOfNOTO
                        ? 'bg-white text-[#a4185e] hover:bg-gray-100'
                        : 'bg-[#a4185e] text-white hover:bg-[#8a1450]'
                    }`}
                    style={{ fontFamily: 'Droid Sans, sans-serif' }}
                  >
                    <Calendar size={16} />
                    {venue.NumberEvents} Upcoming Event{venue.NumberEvents > 1 ? 's' : ''}
                  </a>
              ) : null}

                <div className="flex gap-2">
                  {venue.website && (
                    <a
                      href={venue.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleClick(venue.id, venue.venueName, 'website')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors ${
                        venue.friendsOfNOTO
                          ? 'bg-black text-white hover:bg-gray-900'
                          : 'bg-black text-white hover:bg-gray-900'
                      }`}
                      style={{ fontFamily: 'Droid Sans, sans-serif' }}
                    >
                      <ExternalLink size={16} />
                      Website
                    </a>
                  )}
                  {venue.facebook && (
                    <a
                      href={venue.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleClick(venue.id, venue.venueName, 'facebook')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors ${
                        venue.friendsOfNOTO
                          ? 'bg-[#5dafa7] text-white hover:bg-[#4d9f97]'
                          : 'bg-[#5dafa7] text-white hover:bg-[#4d9f97]'
                      }`}
                      style={{ fontFamily: 'Droid Sans, sans-serif' }}
                    >
                      <Facebook size={16} />
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
