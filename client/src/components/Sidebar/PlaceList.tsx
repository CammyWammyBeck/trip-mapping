import type { Place } from '../../types';
import { PlaceCard } from '../PlaceCard/PlaceCard';
import styles from './Sidebar.module.css';

interface Props {
  places: Place[];
  highlightedPlaceId: number | null;
  onUpdate: (id: number, data: { notes?: string; day_group?: string }) => void;
  onDelete: (id: number) => void;
  onPlaceClick: (place: Place) => void;
}

export function PlaceList({ places, highlightedPlaceId, onUpdate, onDelete, onPlaceClick }: Props) {
  if (places.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No places added yet.</p>
        <p>Search for a location above to get started.</p>
      </div>
    );
  }

  // Group places by day_group
  const grouped = new Map<string, Place[]>();
  for (const place of places) {
    const key = place.day_group || '';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(place);
  }

  // Sort: ungrouped first, then by day label
  const sortedGroups = [...grouped.entries()].sort(([a], [b]) => {
    if (a === '' && b !== '') return -1;
    if (a !== '' && b === '') return 1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  return (
    <div>
      {sortedGroups.map(([group, groupPlaces]) => (
        <div key={group} className={styles.dayGroup}>
          {group && <div className={styles.dayGroupLabel}>{group}</div>}
          {groupPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              highlighted={place.id === highlightedPlaceId}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onClick={onPlaceClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
