from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import trips, places

app = FastAPI(title="Trip Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trips.router, prefix="/api/trips", tags=["trips"])
app.include_router(places.router, prefix="/api", tags=["places"])
