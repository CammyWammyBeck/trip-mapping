import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Place, DayDensity } from '../../types';
import type { DayWarning } from '../../hooks/useDayWarnings';
import { PlaceCard } from '../PlaceCard/PlaceCard';
import { DensityLabel } from './DayDensityBadge';
import styles from './Sidebar.module.css';

interface Props {
  places: Place[];
  highlightedPlaceId: number | null;
  onUpdate: (id: number, data: { notes?: string; day_group?: string; sort_order?: number }) => void;
  onDelete: (id: number) => void;
  onPlaceClick: (place: Place) => void;
  dayDensities?: Map<string, DayDensity>;
  dayWarnings?: Map<string, DayWarning>;
}

function SortablePlaceCard({
  place,
  highlighted,
  onUpdate,
  onDelete,
  onClick,
}: {
  place: Place;
  highlighted: boolean;
  onUpdate: (id: number, data: { notes?: string; day_group?: string }) => void;
  onDelete: (id: number) => void;
  onClick: (place: Place) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: place.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} style={{ cursor: 'grab' }}>
        <PlaceCard
          place={place}
          highlighted={highlighted}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClick={onClick}
        />
      </div>
    </div>
  );
}

export function PlaceList({ places, highlightedPlaceId, onUpdate, onDelete, onPlaceClick, dayDensities, dayWarnings }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = places.findIndex((p) => p.id === active.id);
      const newIndex = places.findIndex((p) => p.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      // Persist the new sort_order for the moved item
      onUpdate(Number(active.id), { sort_order: newIndex });
    },
    [places, onUpdate]
  );

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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div>
        {sortedGroups.map(([group, groupPlaces]) => (
          <div key={group} className={styles.dayGroup}>
            {group && (
              <>
                <div className={styles.dayGroupLabel}>
                  {group}
                  {dayDensities?.get(group) && <DensityLabel density={dayDensities.get(group)!} />}
                  {dayWarnings?.has(group) && (
                    <span
                      title={dayWarnings.get(group)!.message}
                      style={{ marginLeft: 6, cursor: 'help', color: '#e65100', fontSize: 14 }}
                    >
                      &#9888;
                    </span>
                  )}
                </div>
                {dayWarnings?.has(group) && (
                  <div style={{ fontSize: 11, color: '#e65100', padding: '0 8px 4px', lineHeight: 1.3 }}>
                    {dayWarnings.get(group)!.message}
                  </div>
                )}
              </>
            )}
            <SortableContext items={groupPlaces.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              {groupPlaces.map((place) => (
                <SortablePlaceCard
                  key={place.id}
                  place={place}
                  highlighted={place.id === highlightedPlaceId}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onClick={onPlaceClick}
                />
              ))}
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
