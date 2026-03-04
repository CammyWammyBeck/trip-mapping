from datetime import datetime

from pydantic import BaseModel


class PlaceCreate(BaseModel):
    name: str
    address: str = ""
    lat: float
    lng: float
    place_id: str = ""
    day_group: str = ""


class PlaceUpdate(BaseModel):
    notes: str | None = None
    day_group: str | None = None
    sort_order: int | None = None


class PlaceRead(BaseModel):
    id: int
    trip_id: int
    name: str
    address: str
    lat: float
    lng: float
    place_id: str
    notes: str
    sort_order: int
    day_group: str
    created_at: datetime

    model_config = {"from_attributes": True}
