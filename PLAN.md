# Trip Mapping - Architecture Plan

## Overview
A trip planning web app where users can search for locations (with autocomplete), save them to organized trips, view them on a map with routes between pins, and add notes to each location.

---

## Tech Stack

### Frontend
- **React 18 + TypeScript** (scaffolded with Vite)
- **@vis.gl/react-google-maps** — Google's official React wrapper for Maps
- **Google Places Autocomplete API** — for location search with suggestions as you type
- **Google Directions API** — for route visualization between pins
- **CSS Modules** — lightweight styling, no extra dependencies

### Backend
- **Node.js + Express + TypeScript**
- **SQLite** via `better-sqlite3` — zero-config, file-based database (perfect for personal use, no external DB server needed)
- **RESTful API** — simple CRUD endpoints

### Tooling
- **Vite** — fast dev server + build
- **tsx** — run TypeScript backend directly in dev
- **concurrently** — run frontend + backend in a single `npm run dev`

---

## Project Structure

```
trip-mapping/
├── package.json              # Root package.json (workspaces or scripts)
├── client/                   # Frontend (Vite + React)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── types.ts          # Shared TypeScript types
│       ├── api.ts            # API client functions
│       ├── components/
│       │   ├── Sidebar/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Sidebar.module.css
│       │   │   ├── TripSelector.tsx
│       │   │   ├── PlaceSearch.tsx
│       │   │   └── PlaceList.tsx
│       │   ├── Map/
│       │   │   ├── MapView.tsx
│       │   │   └── MapView.module.css
│       │   └── PlaceCard/
│       │       ├── PlaceCard.tsx
│       │       └── PlaceCard.module.css
│       └── hooks/
│           ├── useTrips.ts
│           └── usePlaces.ts
├── server/                   # Backend (Express)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts          # Express server entry
│       ├── db.ts             # SQLite setup + migrations
│       └── routes/
│           ├── trips.ts      # Trip CRUD routes
│           └── places.ts     # Place CRUD routes
└── .gitignore
```

---

## Database Schema (SQLite)

### `trips` table
| Column       | Type    | Notes                    |
|-------------|---------|--------------------------|
| id          | INTEGER | Primary key, autoincrement |
| name        | TEXT    | Trip name (e.g. "Japan 2026") |
| created_at  | TEXT    | ISO timestamp             |

### `places` table
| Column       | Type    | Notes                         |
|-------------|---------|-------------------------------|
| id          | INTEGER | Primary key, autoincrement     |
| trip_id     | INTEGER | Foreign key → trips.id         |
| name        | TEXT    | Place name from Google Places  |
| address     | TEXT    | Formatted address              |
| lat         | REAL    | Latitude                       |
| lng         | REAL    | Longitude                      |
| place_id    | TEXT    | Google Place ID (for dedup)    |
| notes       | TEXT    | User's personal notes          |
| sort_order  | INTEGER | Position in the list           |
| day_group   | TEXT    | Optional day label (e.g. "Day 1") |
| created_at  | TEXT    | ISO timestamp                  |

---

## API Endpoints

### Trips
- `GET    /api/trips`         — List all trips
- `POST   /api/trips`         — Create a trip `{ name }`
- `PUT    /api/trips/:id`     — Update trip name
- `DELETE /api/trips/:id`     — Delete trip + cascade places

### Places
- `GET    /api/trips/:tripId/places`    — List places for a trip
- `POST   /api/trips/:tripId/places`    — Add a place `{ name, address, lat, lng, place_id, day_group }`
- `PUT    /api/places/:id`              — Update place (notes, day_group, sort_order)
- `DELETE /api/places/:id`              — Remove a place

---

## Key UI Components

### Sidebar (left panel, ~350px wide)
1. **TripSelector** — Dropdown to switch between trips + "New Trip" button
2. **PlaceSearch** — Google Places Autocomplete input. As user types, shows dropdown with place suggestions. Selecting one adds it to the current trip
3. **PlaceList** — Scrollable list of saved places, grouped by `day_group`. Each item shows:
   - Place name + address
   - Expandable notes field (click to edit)
   - Delete button
   - Drag handle for reordering (stretch goal, can skip initially)

### MapView (fills remaining space)
- Shows all pins for the current trip
- Clicking a pin highlights the place in the sidebar
- Route lines drawn between consecutive places (using Directions API or simple polylines)
- Map auto-fits bounds to show all pins

---

## Google APIs Required
1. **Maps JavaScript API** — rendering the map
2. **Places API (New)** — autocomplete search suggestions
3. **Directions API** — route polylines between locations (optional, can use straight lines initially)

User will need a Google Cloud API key with these APIs enabled.

---

## Implementation Order

### Phase 1: Project scaffolding
- Initialize Vite React app in `client/`
- Initialize Express server in `server/`
- Root package.json with dev scripts
- .gitignore

### Phase 2: Backend
- SQLite database setup with migrations
- Trip CRUD endpoints
- Place CRUD endpoints

### Phase 3: Frontend — Map + Search
- Google Maps rendering (MapView)
- Places Autocomplete search (PlaceSearch)
- Basic sidebar layout

### Phase 4: Frontend — Full CRUD
- Trip creation/selection (TripSelector)
- Place list display (PlaceList + PlaceCard)
- Add/delete places, edit notes
- API integration (api.ts + hooks)

### Phase 5: Route visualization
- Draw route lines between pins on the map
- Day grouping in sidebar

### Phase 6: Polish
- Responsive layout tweaks
- Loading/error states
- Empty states (no trips, no places)
