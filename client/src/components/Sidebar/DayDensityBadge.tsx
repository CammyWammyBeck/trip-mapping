import { useState, useEffect } from 'react';
import { densityApi } from '../../api';
import type { DayDensity } from '../../types';

interface Props {
  tripId: number | null;
  /** Triggers refetch when places change */
  placesVersion: number;
}

export function DayDensityBadge({ tripId, placesVersion }: Props) {
  const [densities, setDensities] = useState<Map<string, DayDensity>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tripId == null) {
      setDensities(new Map());
      return;
    }

    setLoading(true);
    densityApi
      .get(tripId)
      .then((resp) => {
        const map = new Map<string, DayDensity>();
        for (const d of resp.days) {
          map.set(d.day_group, d);
        }
        setDensities(map);
      })
      .catch(() => {
        // Density is a nice-to-have; silently fail
        setDensities(new Map());
      })
      .finally(() => setLoading(false));
  }, [tripId, placesVersion]);

  if (loading || densities.size === 0) return null;

  return { densities };
}

/** Small inline badge to show next to a day group label */
export function DensityLabel({ density }: { density: DayDensity }) {
  if (density.total_travel_seconds === 0) return null;

  return (
    <span
      style={{
        display: 'inline-block',
        marginLeft: 8,
        padding: '1px 6px',
        borderRadius: 4,
        background: density.total_travel_seconds > 7200 ? '#fce8e6' : '#e8f5e9',
        color: density.total_travel_seconds > 7200 ? '#c62828' : '#2e7d32',
        fontSize: 11,
        fontWeight: 500,
      }}
      title={density.legs.map((l) => `${l.from_name} → ${l.to_name}: ${l.duration_text}`).join('\n')}
    >
      {density.total_travel_text} travel
    </span>
  );
}
