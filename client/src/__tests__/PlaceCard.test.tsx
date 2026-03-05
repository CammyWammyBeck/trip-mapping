import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlaceCard } from '../components/PlaceCard/PlaceCard';
import type { Place } from '../types';

const mockPlace: Place = {
  id: 1,
  trip_id: 1,
  name: 'Eiffel Tower',
  address: 'Champ de Mars, Paris',
  lat: 48.8584,
  lng: 2.2945,
  place_id: 'abc',
  notes: '',
  sort_order: 0,
  day_group: 'Day 1',
  created_at: '2026-01-01T00:00:00Z',
};

describe('PlaceCard', () => {
  it('renders place name and address', () => {
    render(
      <PlaceCard
        place={mockPlace}
        highlighted={false}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onClick={vi.fn()}
      />
    );
    expect(screen.getByText('Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByText('Champ de Mars, Paris')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(
      <PlaceCard
        place={mockPlace}
        highlighted={false}
        onUpdate={vi.fn()}
        onDelete={onDelete}
        onClick={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTitle('Remove place'));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('calls onClick when card clicked', () => {
    const onClick = vi.fn();
    render(
      <PlaceCard
        place={mockPlace}
        highlighted={false}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onClick={onClick}
      />
    );
    fireEvent.click(screen.getByText('Eiffel Tower'));
    expect(onClick).toHaveBeenCalledWith(mockPlace);
  });

  it('updates notes on blur', () => {
    const onUpdate = vi.fn();
    render(
      <PlaceCard
        place={mockPlace}
        highlighted={false}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
        onClick={vi.fn()}
      />
    );
    const textarea = screen.getByPlaceholderText('Add notes...');
    fireEvent.change(textarea, { target: { value: 'Great view!' } });
    fireEvent.blur(textarea);
    expect(onUpdate).toHaveBeenCalledWith(1, { notes: 'Great view!' });
  });

  it('shows day group selector with current value', () => {
    render(
      <PlaceCard
        place={mockPlace}
        highlighted={false}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onClick={vi.fn()}
      />
    );
    const select = screen.getByDisplayValue('Day 1');
    expect(select).toBeInTheDocument();
  });
});
