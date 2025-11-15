import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Facebook } from 'lucide-react';

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
          throw new Error('Failed to fetch venues');
        }

        const data = await response.json();

        if (!data.venues || data.venues.length === 0) {
          throw new Error('No venues found');
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
        <div className="text-gray-600" style={{ fontFamily: 'Droid Sans, sa
