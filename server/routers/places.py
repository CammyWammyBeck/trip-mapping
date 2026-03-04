from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.place import Place
from schemas.place import PlaceCreate, PlaceUpdate, PlaceRead

router = APIRouter()


@router.get("/trips/{trip_id}/places", response_model=list[PlaceRead])
async def list_places(trip_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Place)
        .where(Place.trip_id == trip_id)
        .order_by(Place.day_group, Place.sort_order)
    )
    return result.scalars().all()


@router.post("/trips/{trip_id}/places", response_model=PlaceRead, status_code=201)
async def create_place(trip_id: int, body: PlaceCreate, db: AsyncSession = Depends(get_db)):
    max_order_result = await db.execute(
        select(func.coalesce(func.max(Place.sort_order), -1)).where(
            Place.trip_id == trip_id
        )
    )
    max_order = max_order_result.scalar()

    place = Place(
        trip_id=trip_id,
        name=body.name,
        address=body.address,
        lat=body.lat,
        lng=body.lng,
        place_id=body.place_id,
        day_group=body.day_group,
        sort_order=max_order + 1,
    )
    db.add(place)
    await db.commit()
    await db.refresh(place)
    return place


@router.put("/places/{place_id}", response_model=PlaceRead)
async def update_place(place_id: int, body: PlaceUpdate, db: AsyncSession = Depends(get_db)):
    place = await db.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    if body.notes is not None:
        place.notes = body.notes
    if body.day_group is not None:
        place.day_group = body.day_group
    if body.sort_order is not None:
        place.sort_order = body.sort_order

    await db.commit()
    await db.refresh(place)
    return place


@router.delete("/places/{place_id}", status_code=204)
async def delete_place(place_id: int, db: AsyncSession = Depends(get_db)):
    place = await db.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    await db.delete(place)
    await db.commit()
