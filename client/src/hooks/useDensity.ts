import { useState, useEffect } from 'react';
import { densityApi } from '../api';
import type { DayDensity } from '../types';

export function useDensity(tripId: number | null, placesVersion: number) {
  const [densities, setDensities] = useState<Map<string, DayDensity>>(new Map());

  useEffect(() => {
    if (tripId == null) {
      setDensities(new Map());
      return;
    }

    densityApi
      .get(tripId)
      .then((resp) => {
        const map = new Map<string, DayDensity>();
        for (const d of resp.days) {
          map.set(d.day_group, d);
        }
        setDensities(map);
      })
      .catch(() => setDensities(new Map()));
  }, [tripId, placesVersion]);

  return densities;
}
