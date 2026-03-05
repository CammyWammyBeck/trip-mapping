export interface Trip {
  id: number;
  name: string;
  share_token: string | null;
  created_at: string;
}

export interface SharedTrip {
  id: number;
  name: string;
  created_at: string;
  places: Place[];
}

export interface WaypointDuration {
  from_name: string;
  to_name: string;
  duration_seconds: number;
  duration_text: string;
}

export interface DayDensity {
  day_group: string;
  total_travel_seconds: number;
  total_travel_text: string;
  legs: WaypointDuration[];
}

export interface TripDensityResponse {
  days: DayDensity[];
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
