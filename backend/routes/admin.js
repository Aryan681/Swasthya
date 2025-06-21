import express from 'express';
import { client } from '../utils/redisClient.js';

const router = express.Router();

router.get('/cache', async (req, res) => {
  const keys = await client.keys('*');
  const values = await Promise.all(keys.map(k => client.get(k)));
  res.json(keys.map((k, i) => ({ key: k, value: values[i] })));
});

router.delete('/cache', async (req, res) => {
  await client.flushDb();
  res.json({ success: true });
});

export default router; 