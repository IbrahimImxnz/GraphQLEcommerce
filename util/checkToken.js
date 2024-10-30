const redisClient = require("./redisClient");

const checkToken = async (token) => {
  if (!token) {
    throw new Error("Unauthorized");
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  const isBlacklisted = await redisClient.get(token);
  /*if (isBlacklisted) {
    throw new Error("Token is blacklisted");
  }*/
  return !isBlacklisted;
};

module.exports = checkToken;
