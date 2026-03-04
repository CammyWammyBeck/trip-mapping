import { useState, useEffect, useCallback } from 'react';
import type { Trip } from '../types';
import { tripsApi } from '../api';

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tripsApi.list();
      setTrips(data);
      if (data.length > 0 && !data.find((t) => t.id === selectedTripId)) {
        setSelectedTripId(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedTripId]);

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createTrip = useCallback(async (name: string) => {
    const trip = await tripsApi.create(name);
    setTrips((prev) => [trip, ...prev]);
    setSelectedTripId(trip.id);
    return trip;
  }, []);

  const deleteTrip = useCallback(async (id: number) => {
    await tripsApi.remove(id);
    setTrips((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (id === selectedTripId && next.length > 0) {
        setSelectedTripId(next[0].id);
      } else if (next.length === 0) {
        setSelectedTripId(null);
      }
      return next;
    });
  }, [selectedTripId]);

  return { trips, selectedTripId, setSelectedTripId, loading, createTrip, deleteTrip };
}
