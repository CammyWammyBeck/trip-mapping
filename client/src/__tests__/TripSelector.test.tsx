import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TripSelector } from '../components/Sidebar/TripSelector';
import type { Trip } from '../types';

const mockTrips: Trip[] = [
  { id: 1, name: 'Japan 2026', share_token: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 2, name: 'Italy 2026', share_token: 'abc123', created_at: '2026-02-01T00:00:00Z' },
];

describe('TripSelector', () => {
  it('renders trips in the dropdown', () => {
    render(
      <TripSelector
        trips={mockTrips}
        selectedTripId={1}
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Japan 2026')).toBeInTheDocument();
    expect(screen.getByText('Italy 2026')).toBeInTheDocument();
  });

  it('shows empty state when no trips', () => {
    render(
      <TripSelector
        trips={[]}
        selectedTripId={null}
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('No trips yet')).toBeInTheDocument();
  });

  it('shows create form when + button clicked', () => {
    render(
      <TripSelector
        trips={mockTrips}
        selectedTripId={1}
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTitle('New trip'));
    expect(screen.getByPlaceholderText('Trip name (e.g. Japan 2026)')).toBeInTheDocument();
  });

  it('calls onCreate when create form is submitted', () => {
    const onCreate = vi.fn();
    render(
      <TripSelector
        trips={mockTrips}
        selectedTripId={1}
        onSelect={vi.fn()}
        onCreate={onCreate}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTitle('New trip'));
    const input = screen.getByPlaceholderText('Trip name (e.g. Japan 2026)');
    fireEvent.change(input, { target: { value: 'New Trip' } });
    fireEvent.click(screen.getByText('Create'));
    expect(onCreate).toHaveBeenCalledWith('New Trip');
  });
});
