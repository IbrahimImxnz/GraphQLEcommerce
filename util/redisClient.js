const redis = require("redis");
require("dotenv").config();

const redisClient = redis.createClient(process.env.REDIS_URL);

(async () => {
  await redisClient.connect();
})();

redisClient.on("ready", () => {
  console.log("Redis connected");
});

redisClient.on("error", (err) => {
  console.log(err);
});

module.exports = redisClient;
