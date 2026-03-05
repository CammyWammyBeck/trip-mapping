import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.trip import Trip
from schemas.trip import ShareTokenResponse, SharedTripRead

router = APIRouter()


@router.post("/trips/{trip_id}/share", response_model=ShareTokenResponse)
async def generate_share_token(trip_id: int, db: AsyncSession = Depends(get_db)):
    trip = await db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if not trip.share_token:
        trip.share_token = uuid.uuid4().hex
        await db.commit()
        await db.refresh(trip)

    return ShareTokenResponse(share_token=trip.share_token)


@router.get("/share/{token}", response_model=SharedTripRead)
async def get_shared_trip(token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Trip)
        .where(Trip.share_token == token)
        .options(selectinload(Trip.places))
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Shared trip not found")

    return trip
