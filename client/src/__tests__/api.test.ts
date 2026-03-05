import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tripsApi, placesApi, shareApi } from '../api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

function noContentResponse() {
  return { ok: true, status: 204, json: () => Promise.resolve(undefined), text: () => Promise.resolve('') };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('tripsApi', () => {
  it('list fetches /api/trips', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([{ id: 1, name: 'Trip' }]));
    const result = await tripsApi.list();
    expect(result).toEqual([{ id: 1, name: 'Trip' }]);
    expect(mockFetch).toHaveBeenCalledWith('/api/trips', expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }));
  });

  it('create sends POST', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: 1, name: 'New' }));
    await tripsApi.create('New');
    expect(mockFetch).toHaveBeenCalledWith('/api/trips', expect.objectContaining({ method: 'POST' }));
  });

  it('remove sends DELETE', async () => {
    mockFetch.mockResolvedValueOnce(noContentResponse());
    await tripsApi.remove(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/trips/1', expect.objectContaining({ method: 'DELETE' }));
  });
});

describe('placesApi', () => {
  it('list fetches places for trip', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));
    await placesApi.list(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/trips/1/places', expect.anything());
  });

  it('create sends POST with place data', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: 1 }));
    await placesApi.create(1, { name: 'X', address: '', lat: 0, lng: 0, place_id: '' });
    expect(mockFetch).toHaveBeenCalledWith('/api/trips/1/places', expect.objectContaining({ method: 'POST' }));
  });
});

describe('shareApi', () => {
  it('generateToken sends POST', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ share_token: 'abc' }));
    const result = await shareApi.generateToken(1);
    expect(result.share_token).toBe('abc');
    expect(mockFetch).toHaveBeenCalledWith('/api/trips/1/share', expect.objectContaining({ method: 'POST' }));
  });

  it('getSharedTrip fetches by token', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: 1, name: 'Trip', places: [] }));
    const result = await shareApi.getSharedTrip('abc');
    expect(result.name).toBe('Trip');
    expect(mockFetch).toHaveBeenCalledWith('/api/share/abc', expect.anything());
  });
});
