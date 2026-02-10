import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const setCache = async (key, value, ttl = 3600) => {
  try {
    await connectRedis();
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttl,
    });
  } catch (err) {
    console.error(`Error setting cache for key ${key}:`, err);
  }
};

export const getCache = async (key) => {
  try {
    await connectRedis();
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Error getting cache for key ${key}:`, err);
    return null;
  }
};

export const deleteCache = async (key) => {
  try {
    await connectRedis();
    await redisClient.del(key);
  } catch (err) {
    console.error(`Error deleting cache for key ${key}:`, err);
  }
};

export const deleteCacheByPattern = async (pattern) => {
  try {
    await connectRedis();
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error(`Error deleting cache by pattern ${pattern}:`, err);
  }
};

export default redisClient;
