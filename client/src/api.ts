import type { Trip, Place, SharedTrip, TripDensityResponse } from './types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const tripsApi = {
  list: () => request<Trip[]>('/trips'),
  create: (name: string) => request<Trip>('/trips', { method: 'POST', body: JSON.stringify({ name }) }),
  update: (id: number, name: string) => request<Trip>(`/trips/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  remove: (id: number) => request<void>(`/trips/${id}`, { method: 'DELETE' }),
};

export const shareApi = {
  generateToken: (tripId: number) =>
    request<{ share_token: string }>(`/trips/${tripId}/share`, { method: 'POST' }),
  getSharedTrip: (token: string) => request<SharedTrip>(`/share/${token}`),
};

export const densityApi = {
  get: (tripId: number) => request<TripDensityResponse>(`/trips/${tripId}/density`),
};

export const placesApi = {
  list: (tripId: number) => request<Place[]>(`/trips/${tripId}/places`),
  create: (tripId: number, data: { name: string; address: string; lat: number; lng: number; place_id: string; day_group?: string }) =>
    request<Place>(`/trips/${tripId}/places`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { notes?: string; day_group?: string; sort_order?: number }) =>
    request<Place>(`/places/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/places/${id}`, { method: 'DELETE' }),
};
