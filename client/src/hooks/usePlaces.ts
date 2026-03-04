import { useState, useEffect, useCallback } from 'react';
import type { Place } from '../types';
import { placesApi } from '../api';

export function usePlaces(tripId: number | null) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaces = useCallback(async () => {
    if (tripId == null) {
      setPlaces([]);
      return;
    }
    setLoading(true);
    try {
      const data = await placesApi.list(tripId);
      setPlaces(data);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const addPlace = useCallback(
    async (data: { name: string; address: string; lat: number; lng: number; place_id: string }) => {
      if (tripId == null) return;
      const place = await placesApi.create(tripId, data);
      setPlaces((prev) => [...prev, place]);
      return place;
    },
    [tripId]
  );

  const updatePlace = useCallback(
    async (id: number, data: { notes?: string; day_group?: string; sort_order?: number }) => {
      const updated = await placesApi.update(id, data);
      setPlaces((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    },
    []
  );

  const removePlace = useCallback(async (id: number) => {
    await placesApi.remove(id);
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { places, loading, addPlace, updatePlace, removePlace };
}
