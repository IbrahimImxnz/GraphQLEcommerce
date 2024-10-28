const redisClient = require("../GQLSchemas/schema");

exports.checkToken = async (token) => {
  if (!token) {
    throw new Error("Unauthorized");
  }

  const isBlacklisted = await redisClient.get(token);
  if (isBlacklisted) {
    throw new Error("Token is blacklisted");
  }
};
