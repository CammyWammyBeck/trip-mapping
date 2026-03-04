import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const trips = db.prepare('SELECT * FROM trips ORDER BY created_at DESC').all();
  res.json(trips);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const result = db.prepare('INSERT INTO trips (name) VALUES (?)').run(name);
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(trip);
});

router.put('/:id', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const result = db.prepare('UPDATE trips SET name = ? WHERE id = ?').run(name, req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'trip not found' });
    return;
  }
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
  res.json(trip);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM trips WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'trip not found' });
    return;
  }
  res.status(204).end();
});

export default router;
