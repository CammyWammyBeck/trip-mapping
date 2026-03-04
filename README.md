# Trip Planner

A web app for planning holiday trips. Search for landmarks and locations with autocomplete, save them to organized trips, view them on an interactive map with route lines, and add personal notes.

## Features

- **Place search** with Google Places Autocomplete — suggestions appear as you type
- **Interactive map** showing all saved locations as labeled pins
- **Trip management** — create, switch between, and delete multiple trips
- **Day grouping** — organize places into Day 1, Day 2, etc.
- **Route visualization** — colored polylines connecting places within each day group
- **Notes** — add personal notes to any saved location
- **Persistent storage** — all data saved to a SQLite database via REST API

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript, Vite |
| Maps | Google Maps via `@vis.gl/react-google-maps` |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite via `better-sqlite3` |

## Prerequisites

- Node.js 18+
- A Google Cloud API key with these APIs enabled:
  - Maps JavaScript API
  - Places API
  - Directions API (optional, for future route features)

## Getting Started

1. **Clone and install dependencies:**

   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

2. **Add your Google Maps API key:**

   Create `client/.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Run the dev server:**

   ```bash
   npm run dev
   ```

   This starts both the frontend (http://localhost:5173) and backend (http://localhost:3001) concurrently.

## Project Structure

```
trip-mapping/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── App.tsx         # Main layout + state
│       ├── api.ts          # Backend API client
│       ├── types.ts        # TypeScript interfaces
│       ├── hooks/          # useTrips, usePlaces
│       └── components/
│           ├── Sidebar/    # TripSelector, PlaceSearch, PlaceList
│           ├── Map/        # MapView with pins + routes
│           └── PlaceCard/  # Individual place card with notes
├── server/                 # Express backend
│   └── src/
│       ├── index.ts        # Express server entry
│       ├── db.ts           # SQLite setup
│       └── routes/         # trips.ts, places.ts
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/trips` | List all trips |
| POST | `/api/trips` | Create a trip |
| PUT | `/api/trips/:id` | Rename a trip |
| DELETE | `/api/trips/:id` | Delete trip + its places |
| GET | `/api/trips/:tripId/places` | List places for a trip |
| POST | `/api/trips/:tripId/places` | Add a place |
| PUT | `/api/places/:id` | Update place (notes, day group) |
| DELETE | `/api/places/:id` | Remove a place |
