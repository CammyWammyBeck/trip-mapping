import pytest
import pytest_asyncio
from httpx import AsyncClient


@pytest_asyncio.fixture
async def trip_with_places(client: AsyncClient):
    trip = await client.post("/api/trips/", json={"name": "Shared Trip"})
    trip_id = trip.json()["id"]
    await client.post(f"/api/trips/{trip_id}/places", json={"name": "Place A", "lat": 10, "lng": 20})
    await client.post(f"/api/trips/{trip_id}/places", json={"name": "Place B", "lat": 30, "lng": 40})
    return trip_id


@pytest.mark.asyncio
async def test_generate_share_token(client: AsyncClient, trip_with_places: int):
    resp = await client.post(f"/api/trips/{trip_with_places}/share")
    assert resp.status_code == 200
    data = resp.json()
    assert "share_token" in data
    assert len(data["share_token"]) == 32  # uuid4().hex


@pytest.mark.asyncio
async def test_generate_share_token_idempotent(client: AsyncClient, trip_with_places: int):
    r1 = await client.post(f"/api/trips/{trip_with_places}/share")
    r2 = await client.post(f"/api/trips/{trip_with_places}/share")
    assert r1.json()["share_token"] == r2.json()["share_token"]


@pytest.mark.asyncio
async def test_get_shared_trip(client: AsyncClient, trip_with_places: int):
    share_resp = await client.post(f"/api/trips/{trip_with_places}/share")
    token = share_resp.json()["share_token"]

    resp = await client.get(f"/api/share/{token}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Shared Trip"
    assert len(data["places"]) == 2


@pytest.mark.asyncio
async def test_get_shared_trip_not_found(client: AsyncClient):
    resp = await client.get("/api/share/nonexistent")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_share_trip_not_found(client: AsyncClient):
    resp = await client.post("/api/trips/9999/share")
    assert resp.status_code == 404
