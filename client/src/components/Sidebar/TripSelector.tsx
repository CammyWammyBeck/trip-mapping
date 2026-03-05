import { useState } from 'react';
import type { Trip } from '../../types';
import { ShareButton } from './ShareButton';

interface Props {
  trips: Trip[];
  selectedTripId: number | null;
  onSelect: (id: number) => void;
  onCreate: (name: string) => void;
  onDelete: (id: number) => void;
}

export function TripSelector({ trips, selectedTripId, onSelect, onCreate, onDelete }: Props) {
  const selectedTrip = trips.find((t) => t.id === selectedTripId);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    onCreate(name);
    setNewName('');
    setIsCreating(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select
          value={selectedTripId ?? ''}
          onChange={(e) => onSelect(Number(e.target.value))}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #d0d0d0',
            fontSize: 14,
            background: '#fff',
          }}
        >
          {trips.length === 0 && <option value="">No trips yet</option>}
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setIsCreating(!isCreating)}
          title="New trip"
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #d0d0d0',
            background: '#4285f4',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          +
        </button>
        {selectedTripId != null && (
          <>
            <ShareButton
              tripId={selectedTripId}
              existingToken={selectedTrip?.share_token ?? null}
            />
            <button
              onClick={() => {
                if (confirm('Delete this trip and all its places?')) {
                  onDelete(selectedTripId);
                }
              }}
              title="Delete trip"
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #d0d0d0',
                background: '#ea4335',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              &times;
            </button>
          </>
        )}
      </div>
      {isCreating && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Trip name (e.g. Japan 2026)"
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #d0d0d0',
              fontSize: 14,
            }}
          />
          <button
            onClick={handleCreate}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: '#34a853',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Create
          </button>
        </div>
      )}
    </div>
  );
}
