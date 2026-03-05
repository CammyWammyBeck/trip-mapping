import pytest
import pytest_asyncio
from httpx import AsyncClient


@pytest_asyncio.fixture
async def trip_id(client: AsyncClient):
    resp = await client.post("/api/trips/", json={"name": "Test Trip"})
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_create_place(client: AsyncClient, trip_id: int):
    resp = await client.post(
        f"/api/trips/{trip_id}/places",
        json={"name": "Eiffel Tower", "address": "Paris", "lat": 48.8584, "lng": 2.2945, "place_id": "abc"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Eiffel Tower"
    assert data["trip_id"] == trip_id
    assert data["sort_order"] == 0


@pytest.mark.asyncio
async def test_list_places(client: AsyncClient, trip_id: int):
    await client.post(f"/api/trips/{trip_id}/places", json={"name": "A", "lat": 0, "lng": 0})
    await client.post(f"/api/trips/{trip_id}/places", json={"name": "B", "lat": 1, "lng": 1})

    resp = await client.get(f"/api/trips/{trip_id}/places")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


@pytest.mark.asyncio
async def test_sort_order_auto_increments(client: AsyncClient, trip_id: int):
    r1 = await client.post(f"/api/trips/{trip_id}/places", json={"name": "A", "lat": 0, "lng": 0})
    r2 = await client.post(f"/api/trips/{trip_id}/places", json={"name": "B", "lat": 1, "lng": 1})

    assert r1.json()["sort_order"] == 0
    assert r2.json()["sort_order"] == 1


@pytest.mark.asyncio
async def test_update_place_notes(client: AsyncClient, trip_id: int):
    create = await client.post(f"/api/trips/{trip_id}/places", json={"name": "X", "lat": 0, "lng": 0})
    place_id = create.json()["id"]

    resp = await client.put(f"/api/places/{place_id}", json={"notes": "Great view!"})
    assert resp.status_code == 200
    assert resp.json()["notes"] == "Great view!"


@pytest.mark.asyncio
async def test_update_place_day_group(client: AsyncClient, trip_id: int):
    create = await client.post(f"/api/trips/{trip_id}/places", json={"name": "X", "lat": 0, "lng": 0})
    place_id = create.json()["id"]

    resp = await client.put(f"/api/places/{place_id}", json={"day_group": "Day 1"})
    assert resp.status_code == 200
    assert resp.json()["day_group"] == "Day 1"


@pytest.mark.asyncio
async def test_delete_place(client: AsyncClient, trip_id: int):
    create = await client.post(f"/api/trips/{trip_id}/places", json={"name": "X", "lat": 0, "lng": 0})
    place_id = create.json()["id"]

    resp = await client.delete(f"/api/places/{place_id}")
    assert resp.status_code == 204

    list_resp = await client.get(f"/api/trips/{trip_id}/places")
    assert len(list_resp.json()) == 0


@pytest.mark.asyncio
async def test_cascade_delete(client: AsyncClient, trip_id: int):
    await client.post(f"/api/trips/{trip_id}/places", json={"name": "X", "lat": 0, "lng": 0})
    await client.delete(f"/api/trips/{trip_id}")

    resp = await client.get(f"/api/trips/{trip_id}/places")
    assert len(resp.json()) == 0
