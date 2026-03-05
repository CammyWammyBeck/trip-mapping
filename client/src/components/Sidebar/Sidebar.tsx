import type { Trip, Place, DayDensity } from '../../types';
import type { DayWarning } from '../../hooks/useDayWarnings';
import { TripSelector } from './TripSelector';
import { PlaceSearch } from './PlaceSearch';
import { PlaceList } from './PlaceList';
import styles from './Sidebar.module.css';

interface Props {
  trips: Trip[];
  selectedTripId: number | null;
  onSelectTrip: (id: number) => void;
  onCreateTrip: (name: string) => void;
  onDeleteTrip: (id: number) => void;
  places: Place[];
  highlightedPlaceId: number | null;
  onAddPlace: (data: { name: string; address: string; lat: number; lng: number; place_id: string }) => void;
  onUpdatePlace: (id: number, data: { notes?: string; day_group?: string; sort_order?: number }) => void;
  onDeletePlace: (id: number) => void;
  onPlaceClick: (place: Place) => void;
  dayDensities?: Map<string, DayDensity>;
  dayWarnings?: Map<string, DayWarning>;
}

export function Sidebar({
  trips,
  selectedTripId,
  onSelectTrip,
  onCreateTrip,
  onDeleteTrip,
  places,
  highlightedPlaceId,
  onAddPlace,
  onUpdatePlace,
  onDeletePlace,
  onPlaceClick,
  dayDensities,
  dayWarnings,
}: Props) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.title}>Trip Planner</h1>
        <TripSelector
          trips={trips}
          selectedTripId={selectedTripId}
          onSelect={onSelectTrip}
          onCreate={onCreateTrip}
          onDelete={onDeleteTrip}
        />
        <PlaceSearch onSelect={onAddPlace} disabled={selectedTripId == null} />
      </div>
      <div className={styles.placeList}>
        <PlaceList
          places={places}
          highlightedPlaceId={highlightedPlaceId}
          onUpdate={onUpdatePlace}
          onDelete={onDeletePlace}
          onPlaceClick={onPlaceClick}
          dayDensities={dayDensities}
          dayWarnings={dayWarnings}
        />
      </div>
    </div>
  );
}
