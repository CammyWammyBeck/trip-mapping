import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_trip(client: AsyncClient):
    resp = await client.post("/api/trips/", json={"name": "Japan 2026"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Japan 2026"
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_list_trips(client: AsyncClient):
    await client.post("/api/trips/", json={"name": "Trip A"})
    await client.post("/api/trips/", json={"name": "Trip B"})

    resp = await client.get("/api/trips/")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_update_trip(client: AsyncClient):
    create = await client.post("/api/trips/", json={"name": "Old Name"})
    trip_id = create.json()["id"]

    resp = await client.put(f"/api/trips/{trip_id}", json={"name": "New Name"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"


@pytest.mark.asyncio
async def test_delete_trip(client: AsyncClient):
    create = await client.post("/api/trips/", json={"name": "To Delete"})
    trip_id = create.json()["id"]

    resp = await client.delete(f"/api/trips/{trip_id}")
    assert resp.status_code == 204

    list_resp = await client.get("/api/trips/")
    assert len(list_resp.json()) == 0


@pytest.mark.asyncio
async def test_delete_trip_not_found(client: AsyncClient):
    resp = await client.delete("/api/trips/9999")
    assert resp.status_code == 404
