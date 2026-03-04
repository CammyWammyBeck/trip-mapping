import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/trips/:tripId/places', (req, res) => {
  const places = db
    .prepare('SELECT * FROM places WHERE trip_id = ? ORDER BY day_group, sort_order')
    .all(req.params.tripId);
  res.json(places);
});

router.post('/trips/:tripId/places', (req, res) => {
  const { name, address, lat, lng, place_id, day_group } = req.body;
  if (!name || lat == null || lng == null) {
    res.status(400).json({ error: 'name, lat, and lng are required' });
    return;
  }

  const maxOrder = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) as max_order FROM places WHERE trip_id = ?')
    .get(req.params.tripId) as { max_order: number };

  const result = db
    .prepare(
      `INSERT INTO places (trip_id, name, address, lat, lng, place_id, day_group, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.params.tripId,
      name,
      address || '',
      lat,
      lng,
      place_id || '',
      day_group || '',
      maxOrder.max_order + 1
    );

  const place = db.prepare('SELECT * FROM places WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(place);
});

router.put('/places/:id', (req, res) => {
  const { notes, day_group, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM places WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!existing) {
    res.status(404).json({ error: 'place not found' });
    return;
  }

  db.prepare(
    `UPDATE places SET notes = ?, day_group = ?, sort_order = ? WHERE id = ?`
  ).run(
    notes ?? existing.notes,
    day_group ?? existing.day_group,
    sort_order ?? existing.sort_order,
    req.params.id
  );

  const place = db.prepare('SELECT * FROM places WHERE id = ?').get(req.params.id);
  res.json(place);
});

router.delete('/places/:id', (req, res) => {
  const result = db.prepare('DELETE FROM places WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'place not found' });
    return;
  }
  res.status(204).end();
});

export default router;
