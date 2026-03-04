from datetime import datetime

from pydantic import BaseModel


class TripCreate(BaseModel):
    name: str


class TripUpdate(BaseModel):
    name: str


class TripRead(BaseModel):
    id: int
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}
