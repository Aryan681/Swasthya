import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL;

const client = createClient({ url: redisUrl });

client.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

async function connectWithRetry(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await client.connect();
      console.log('✅ Connected to Redis Cloud');
      return client;
    } catch (err) {
      console.error(`🔁 Redis connection failed (attempt ${i + 1}):`, err.message);
      if (i < retries - 1) await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error('❌ Could not connect to Redis after retries');
}

export { client, connectWithRetry };
