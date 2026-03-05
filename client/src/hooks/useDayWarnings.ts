import { useMemo } from 'react';
import type { Place } from '../types';

export interface DayWarning {
  day_group: string;
  message: string;
}

/**
 * Detects backtracking within a day group by comparing the total route
 * distance (sum of consecutive legs) to the straight-line distance from
 * first to last place. A ratio > 2.0 suggests the route doubles back
 * significantly.
 */
export function useDayWarnings(places: Place[]): Map<string, DayWarning> {
  return useMemo(() => {
    const warnings = new Map<string, DayWarning>();

    // Group places by day_group
    const groups = new Map<string, Place[]>();
    for (const p of places) {
      const key = p.day_group || '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }

    for (const [group, groupPlaces] of groups) {
      if (!group || groupPlaces.length < 3) continue;

      // Calculate total route distance (sum of consecutive legs)
      let routeDistance = 0;
      for (let i = 0; i < groupPlaces.length - 1; i++) {
        routeDistance += haversine(
          groupPlaces[i].lat, groupPlaces[i].lng,
          groupPlaces[i + 1].lat, groupPlaces[i + 1].lng
        );
      }

      // Calculate straight-line distance from first to last
      const directDistance = haversine(
        groupPlaces[0].lat, groupPlaces[0].lng,
        groupPlaces[groupPlaces.length - 1].lat, groupPlaces[groupPlaces.length - 1].lng
      );

      // If route distance is much larger than direct distance, flag it
      if (directDistance > 0.5 && routeDistance / directDistance > 2.0) {
        const ratio = (routeDistance / directDistance).toFixed(1);
        warnings.set(group, {
          day_group: group,
          message: `Route backtracks (${ratio}x longer than direct path). Consider reordering.`,
        });
      }

      // Also check for geographic spread: if the bounding box is very large
      const lats = groupPlaces.map((p) => p.lat);
      const lngs = groupPlaces.map((p) => p.lng);
      const latSpread = Math.max(...lats) - Math.min(...lats);
      const lngSpread = Math.max(...lngs) - Math.min(...lngs);
      const spreadKm = haversine(
        Math.min(...lats), Math.min(...lngs),
        Math.max(...lats), Math.max(...lngs)
      );

      if (spreadKm > 100 && !warnings.has(group)) {
        warnings.set(group, {
          day_group: group,
          message: `Places are spread over ${Math.round(spreadKm)} km. This may be too much for one day.`,
        });
      }
    }

    return warnings;
  }, [places]);
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
