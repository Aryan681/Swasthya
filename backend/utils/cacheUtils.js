import { client } from './redisClient.js';

export async function getCache(key) {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis getCache error:', err);
    return null;
  }
}

export async function setCache(key, value, ttl = 3600) {
  try {
    await client.set(key, JSON.stringify(value), { EX: ttl });
  } catch (err) {
    console.error('Redis setCache error:', err);
  }
}

export async function deleteCache(key) {
  try {
    await client.del(key);
  } catch (err) {
    console.error('Redis deleteCache error:', err);
  }
} 