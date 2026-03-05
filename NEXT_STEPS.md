# Next Steps

Immediate priorities for the Trip Planner project, based on what's built versus what's planned in the README.

---

## What's Already Working

- CRUD for trips and places (FastAPI backend + React frontend)
- Google Places Autocomplete search
- Interactive map with labelled pins (AdvancedMarker)
- Route visualisation with coloured polylines per day group
- Day grouping and sort order on places
- Notes on places
- Vite dev proxy to backend

## What's Missing (Phase 1 gaps)

### 1. Write the initial Alembic migration

`server/alembic/versions/` is empty. The models exist but no migration has been generated, so there's no way to set up the database from scratch.

**Action:** Run `alembic revision --autogenerate -m "initial schema"` and verify the output creates the `trips` and `places` tables correctly.

### 2. Add drag-to-reorder for places

`sort_order` is stored but there's no UI to reorder places within a day. Users can only add places in order.

**Action:** Add drag-and-drop reordering to `PlaceList` (e.g. `@dnd-kit/core`) and persist updated `sort_order` values via the existing PUT endpoint.

### 3. Shareable read-only trip links

Listed in the README as a Phase 1 feature. The API endpoints (`POST /api/trips/:id/share`, `GET /api/share/:token`) are documented but not implemented.

**Action:**
- Add a `share_token` column to the `Trip` model (nullable, unique UUID)
- Create the two share endpoints in a new `routers/share.py`
- Add a frontend route (or modal) that generates and displays the share URL
- Build a read-only trip view that loads via the token (no auth required)

### 4. Trip density estimates

Approximate travel + visit time per day using Google Directions API. Documented in the README but not started.

**Action:**
- Add a backend endpoint that takes an ordered list of place coordinates and calls the Google Directions API to get leg durations
- Display per-day estimated travel time in the sidebar next to each day group header

### 5. Smart day warnings (backtracking detection)

Flag days where the route backtracks badly. Documented in the README but not started.

**Action:**
- Calculate geographic spread / convex-hull ratio per day group on the backend (or client-side)
- Show a warning icon on day groups where the route is notably inefficient

### 6. Add tests

There are zero tests on either side of the stack.

**Action:**
- **Backend:** Add `pytest` + `httpx` tests for each router (trips CRUD, places CRUD). Use an in-memory SQLite or test database.
- **Frontend:** Add at least component smoke tests with Vitest + React Testing Library.

### 7. Tighten CORS for production

CORS is currently `allow_origins=["*"]`. Fine for local dev, but needs restricting before deployment.

**Action:** Read allowed origins from an env variable (`ALLOWED_ORIGINS`) and default to `["http://localhost:5173"]` in dev.

---

## Suggested order

| Priority | Task | Why first |
|----------|------|-----------|
| 1 | Alembic migration | Nothing works without the DB schema |
| 2 | Shareable links | Biggest missing Phase 1 feature with user-facing value |
| 3 | Drag-to-reorder | Core UX gap — sort_order exists but can't be changed |
| 4 | Backend + frontend tests | Safety net before adding more complexity |
| 5 | Trip density estimates | Nice-to-have, depends on Directions API quota |
| 6 | Smart day warnings | Can layer on top of density data |
| 7 | CORS config | Must-do before any production deploy |
