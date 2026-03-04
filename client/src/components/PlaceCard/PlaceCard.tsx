import { useState } from 'react';
import type { Place } from '../../types';
import styles from './PlaceCard.module.css';

interface Props {
  place: Place;
  highlighted: boolean;
  onUpdate: (id: number, data: { notes?: string; day_group?: string }) => void;
  onDelete: (id: number) => void;
  onClick: (place: Place) => void;
}

const DAY_OPTIONS = ['', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'];

export function PlaceCard({ place, highlighted, onUpdate, onDelete, onClick }: Props) {
  const [notes, setNotes] = useState(place.notes);

  const handleNotesBlur = () => {
    if (notes !== place.notes) {
      onUpdate(place.id, { notes });
    }
  };

  return (
    <div
      className={`${styles.card} ${highlighted ? styles.highlighted : ''}`}
      onClick={() => onClick(place)}
    >
      <div className={styles.topRow}>
        <div>
          <p className={styles.name}>{place.name}</p>
          {place.address && <p className={styles.address}>{place.address}</p>}
        </div>
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(place.id);
          }}
          title="Remove place"
        >
          &times;
        </button>
      </div>

      <div className={styles.dayGroupRow}>
        <label style={{ fontSize: 12, color: '#666' }}>Group:</label>
        <select
          className={styles.dayGroupSelect}
          value={place.day_group}
          onChange={(e) => onUpdate(place.id, { day_group: e.target.value })}
          onClick={(e) => e.stopPropagation()}
        >
          {DAY_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d || 'None'}
            </option>
          ))}
        </select>
      </div>

      <textarea
        className={styles.notesArea}
        placeholder="Add notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleNotesBlur}
        onClick={(e) => e.stopPropagation()}
        rows={1}
      />
    </div>
  );
}
