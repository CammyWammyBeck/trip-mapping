import { useEffect, useRef, useCallback } from 'react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import type { Place } from '../../types';
import styles from './MapView.module.css';

interface Props {
  places: Place[];
  highlightedPlaceId: number | null;
  onMarkerClick: (place: Place) => void;
  showRoutes: boolean;
}

function RouteRenderer({ places }: { places: Place[] }) {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!map || places.length < 2) return;

    // Group places by day_group, draw routes within each group
    const groups = new Map<string, Place[]>();
    for (const place of places) {
      const key = place.day_group || '__ungrouped__';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(place);
    }

    const colors = ['#4285f4', '#ea4335', '#fbbc04', '#34a853', '#ff6d01', '#46bdc6', '#7b1fa2'];
    let colorIdx = 0;

    for (const [, groupPlaces] of groups) {
      if (groupPlaces.length < 2) continue;

      const path = groupPlaces.map((p) => ({ lat: p.lat, lng: p.lng }));
      const polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: colors[colorIdx % colors.length],
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map,
      });

      polylinesRef.current.push(polyline);
      colorIdx++;
    }

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, places]);

  return null;
}

function BoundsManager({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || places.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    places.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));

    if (places.length === 1) {
      map.setCenter({ lat: places[0].lat, lng: places[0].lng });
      map.setZoom(14);
    } else {
      map.fitBounds(bounds, 60);
    }
  }, [map, places]);

  return null;
}

export function MapView({ places, highlightedPlaceId, onMarkerClick, showRoutes }: Props) {
  const getMarkerStyle = useCallback(
    (place: Place) => {
      const isHighlighted = place.id === highlightedPlaceId;
      return {
        background: isHighlighted ? '#4285f4' : '#ea4335',
        color: '#fff',
        padding: '6px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600 as const,
        boxShadow: isHighlighted
          ? '0 0 0 3px rgba(66,133,244,0.3), 0 2px 6px rgba(0,0,0,0.3)'
          : '0 2px 6px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        transform: isHighlighted ? 'scale(1.15)' : 'scale(1)',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap' as const,
      };
    },
    [highlightedPlaceId]
  );

  return (
    <div className={styles.mapContainer}>
      <Map
        defaultCenter={{ lat: 40, lng: 0 }}
        defaultZoom={3}
        mapId="trip-map"
        gestureHandling="greedy"
        disableDefaultUI={false}
        style={{ width: '100%', height: '100%' }}
      >
        {places.map((place) => (
          <AdvancedMarker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            onClick={() => onMarkerClick(place)}
          >
            <div style={getMarkerStyle(place)}>{place.name}</div>
          </AdvancedMarker>
        ))}
        <BoundsManager places={places} />
        {showRoutes && <RouteRenderer places={places} />}
      </Map>
    </div>
  );
}
