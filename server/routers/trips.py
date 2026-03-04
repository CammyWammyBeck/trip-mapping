from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.trip import Trip
from schemas.trip import TripCreate, TripUpdate, TripRead

router = APIRouter()


@router.get("/", response_model=list[TripRead])
async def list_trips(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Trip).order_by(Trip.created_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=TripRead, status_code=201)
async def create_trip(body: TripCreate, db: AsyncSession = Depends(get_db)):
    trip = Trip(name=body.name)
    db.add(trip)
    await db.commit()
    await db.refresh(trip)
    return trip


@router.put("/{trip_id}", response_model=TripRead)
async def update_trip(trip_id: int, body: TripUpdate, db: AsyncSession = Depends(get_db)):
    trip = await db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.name = body.name
    await db.commit()
    await db.refresh(trip)
    return trip


@router.delete("/{trip_id}", status_code=204)
async def delete_trip(trip_id: int, db: AsyncSession = Depends(get_db)):
    trip = await db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    await db.delete(trip)
    await db.commit()
