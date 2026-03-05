import { useState, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useTrips } from './hooks/useTrips';
import { usePlaces } from './hooks/usePlaces';
import { useDensity } from './hooks/useDensity';
import { useDayWarnings } from './hooks/useDayWarnings';
import { Sidebar } from './components/Sidebar/Sidebar';
import { MapView } from './components/Map/MapView';
import { SharedTripView } from './components/SharedTripView';
import type { Place } from './types';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

function getShareToken(): string | null {
  const match = window.location.pathname.match(/^\/shared\/([a-f0-9]+)$/);
  return match ? match[1] : null;
}

function App() {
  const shareToken = getShareToken();

  if (shareToken) {
    return <SharedTripView token={shareToken} />;
  }

  return <TripPlanner />;
}

function TripPlanner() {
  const { trips, selectedTripId, setSelectedTripId, createTrip, deleteTrip } = useTrips();
  const { places, addPlace, updatePlace, removePlace } = usePlaces(selectedTripId);
  const dayDensities = useDensity(selectedTripId, places.length);
  const dayWarnings = useDayWarnings(places);
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<number | null>(null);

  const handlePlaceClick = useCallback((place: Place) => {
    setHighlightedPlaceId((prev) => (prev === place.id ? null : place.id));
  }, []);

  const handleAddPlace = useCallback(
    (data: { name: string; address: string; lat: number; lng: number; place_id: string }) => {
      addPlace(data);
    },
    [addPlace]
  );

  if (!API_KEY) {
    return (
      <div style={{ padding: 40, maxWidth: 600, margin: '0 auto', fontFamily: 'system-ui' }}>
        <h1>Trip Planner</h1>
        <p>To get started, you need a Google Maps API key.</p>
        <ol>
          <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">Google Cloud Console</a></li>
          <li>Create an API key</li>
          <li>Enable: <strong>Maps JavaScript API</strong>, <strong>Places API</strong>, and <strong>Directions API</strong></li>
          <li>Create a file <code>client/.env</code> with: <pre>VITE_GOOGLE_MAPS_API_KEY=your_key_here</pre></li>
          <li>Restart the dev server</li>
        </ol>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar
          trips={trips}
          selectedTripId={selectedTripId}
          onSelectTrip={setSelectedTripId}
          onCreateTrip={createTrip}
          onDeleteTrip={deleteTrip}
          places={places}
          highlightedPlaceId={highlightedPlaceId}
          onAddPlace={handleAddPlace}
          onUpdatePlace={updatePlace}
          onDeletePlace={removePlace}
          onPlaceClick={handlePlaceClick}
          dayDensities={dayDensities}
          dayWarnings={dayWarnings}
        />
        <MapView
          places={places}
          highlightedPlaceId={highlightedPlaceId}
          onMarkerClick={handlePlaceClick}
          showRoutes={true}
        />
      </div>
    </APIProvider>
  );
}

export default App;
