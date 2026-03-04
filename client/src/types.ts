export interface Trip {
  id: number;
  name: string;
  created_at: string;
}

export interface Place {
  id: number;
  trip_id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
  notes: string;
  sort_order: number;
  day_group: string;
  created_at: string;
}
