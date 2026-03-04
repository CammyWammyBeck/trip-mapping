import { useRef, useEffect, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface Props {
  onSelect: (place: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    place_id: string;
  }) => void;
  disabled?: boolean;
}

export function PlaceSearch({ onSelect, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const places = useMapsLibrary('places');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ['place_id', 'geometry', 'name', 'formatted_address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;

      onSelect({
        name: place.name || '',
        address: place.formatted_address || '',
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        place_id: place.place_id || '',
      });

      setInputValue('');
    });

    autocompleteRef.current = autocomplete;

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [places, onSelect]);

  return (
    <input
      ref={inputRef}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      disabled={disabled}
      placeholder={disabled ? 'Create a trip first' : 'Search for a place...'}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 6,
        border: '1px solid #d0d0d0',
        fontSize: 14,
        boxSizing: 'border-box',
        marginTop: 8,
      }}
    />
  );
}
