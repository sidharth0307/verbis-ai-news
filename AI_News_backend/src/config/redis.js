const { Redis } = require("@upstash/redis");

let redis = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}
console.log("Upstash Redis initialized");
const getRedis = () => redis;

module.exports = { getRedis };
