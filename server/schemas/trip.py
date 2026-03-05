from datetime import datetime

from pydantic import BaseModel


class TripCreate(BaseModel):
    name: str


class TripUpdate(BaseModel):
    name: str


class TripRead(BaseModel):
    id: int
    name: str
    share_token: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SharedPlaceRead(BaseModel):
    id: int
    name: str
    address: str
    lat: float
    lng: float
    notes: str
    sort_order: int
    day_group: str

    model_config = {"from_attributes": True}


class SharedTripRead(BaseModel):
    """Read-only view of a shared trip with its places."""

    id: int
    name: str
    created_at: datetime
    places: list[SharedPlaceRead]

    model_config = {"from_attributes": True}


class ShareTokenResponse(BaseModel):
    share_token: str
