import { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { shareApi } from '../api';
import { MapView } from './Map/MapView';
import { PlaceList } from './Sidebar/PlaceList';
import type { SharedTrip, Place } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface Props {
  token: string;
}

export function SharedTripView({ token }: Props) {
  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<number | null>(null);

  useEffect(() => {
    shareApi.getSharedTrip(token).then(setTrip).catch(() => setError('Trip not found or link has expired.'));
  }, [token]);

  const handlePlaceClick = (place: Place) => {
    setHighlightedPlaceId((prev) => (prev === place.id ? null : place.id));
  };

  if (error) {
    return (
      <div style={{ padding: 40, maxWidth: 600, margin: '0 auto', fontFamily: 'system-ui', textAlign: 'center' }}>
        <h1>Shared Trip</h1>
        <p style={{ color: '#ea4335' }}>{error}</p>
        <a href="/" style={{ color: '#4285f4' }}>Go to Trip Planner</a>
      </div>
    );
  }

  if (!trip) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui' }}>
        <p>Loading shared trip...</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <div style={{ width: 380, minWidth: 380, height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRight: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #e0e0e0', background: '#f8f9fa' }}>
            <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>{trip.name}</h1>
            <p style={{ margin: 0, fontSize: 12, color: '#888' }}>Shared trip (read-only)</p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            <PlaceList
              places={trip.places}
              highlightedPlaceId={highlightedPlaceId}
              onUpdate={() => {}}
              onDelete={() => {}}
              onPlaceClick={handlePlaceClick}
            />
          </div>
        </div>
        <MapView
          places={trip.places}
          highlightedPlaceId={highlightedPlaceId}
          onMarkerClick={handlePlaceClick}
          showRoutes={true}
        />
      </div>
    </APIProvider>
  );
}
