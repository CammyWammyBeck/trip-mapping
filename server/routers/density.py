from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from config import settings
from database import get_db
from models.place import Place

router = APIRouter()


class WaypointDuration(BaseModel):
    from_name: str
    to_name: str
    duration_seconds: int
    duration_text: str


class DayDensity(BaseModel):
    day_group: str
    total_travel_seconds: int
    total_travel_text: str
    legs: list[WaypointDuration]


class TripDensityResponse(BaseModel):
    days: list[DayDensity]


@router.get("/trips/{trip_id}/density", response_model=TripDensityResponse)
async def get_trip_density(trip_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Place)
        .where(Place.trip_id == trip_id)
        .order_by(Place.day_group, Place.sort_order)
    )
    places = result.scalars().all()

    if not places:
        return TripDensityResponse(days=[])

    # Group by day
    groups: dict[str, list[Place]] = {}
    for p in places:
        key = p.day_group or ""
        if key not in groups:
            groups[key] = []
        groups[key].append(p)

    api_key = settings.google_maps_api_key
    if not api_key:
        raise HTTPException(status_code=503, detail="Google Maps API key not configured")

    days: list[DayDensity] = []

    async with httpx.AsyncClient() as client:
        for day_group, day_places in sorted(groups.items()):
            if len(day_places) < 2:
                days.append(DayDensity(
                    day_group=day_group or "Ungrouped",
                    total_travel_seconds=0,
                    total_travel_text="0 min",
                    legs=[],
                ))
                continue

            # Build waypoints for Directions API
            origin = f"{day_places[0].lat},{day_places[0].lng}"
            destination = f"{day_places[-1].lat},{day_places[-1].lng}"
            waypoints = "|".join(
                f"{p.lat},{p.lng}" for p in day_places[1:-1]
            )

            params = {
                "origin": origin,
                "destination": destination,
                "key": api_key,
                "mode": "driving",
            }
            if waypoints:
                params["waypoints"] = waypoints

            resp = await client.get(
                "https://maps.googleapis.com/maps/api/directions/json",
                params=params,
            )
            data = resp.json()

            if data.get("status") != "OK" or not data.get("routes"):
                # Fall back to straight-line estimate
                days.append(_estimate_straight_line(day_group, day_places))
                continue

            route = data["routes"][0]
            legs_data: list[WaypointDuration] = []
            total_seconds = 0

            for i, leg in enumerate(route["legs"]):
                dur = leg["duration"]["value"]
                total_seconds += dur
                legs_data.append(WaypointDuration(
                    from_name=day_places[i].name,
                    to_name=day_places[i + 1].name,
                    duration_seconds=dur,
                    duration_text=leg["duration"]["text"],
                ))

            days.append(DayDensity(
                day_group=day_group or "Ungrouped",
                total_travel_seconds=total_seconds,
                total_travel_text=_format_seconds(total_seconds),
                legs=legs_data,
            ))

    return TripDensityResponse(days=days)


def _estimate_straight_line(day_group: str, places: list[Place]) -> DayDensity:
    """Rough estimate: ~60 km/h average, haversine distance."""
    import math

    total_seconds = 0
    legs: list[WaypointDuration] = []

    for i in range(len(places) - 1):
        a, b = places[i], places[i + 1]
        dist_km = _haversine(a.lat, a.lng, b.lat, b.lng)
        seconds = int(dist_km / 60 * 3600)  # 60 km/h
        total_seconds += seconds
        legs.append(WaypointDuration(
            from_name=a.name,
            to_name=b.name,
            duration_seconds=seconds,
            duration_text=_format_seconds(seconds),
        ))

    return DayDensity(
        day_group=day_group or "Ungrouped",
        total_travel_seconds=total_seconds,
        total_travel_text=_format_seconds(total_seconds),
        legs=legs,
    )


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    import math
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def _format_seconds(s: int) -> str:
    if s < 60:
        return f"{s} sec"
    minutes = s // 60
    if minutes < 60:
        return f"{minutes} min"
    hours = minutes // 60
    remaining = minutes % 60
    if remaining == 0:
        return f"{hours} hr"
    return f"{hours} hr {remaining} min"
