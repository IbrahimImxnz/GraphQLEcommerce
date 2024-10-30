const { GraphQLBoolean } = require("graphql");
const checkToken = require("../../util/checkToken");
const redisClient = require("../../util/redisClient");

exports.Logout = {
  type: GraphQLBoolean,
  description: "Blacklist token when logging out",
  async resolve(parent, args, context) {
    const tokenStatus = await checkToken(context.token);
    if (!tokenStatus) {
      throw new Error("User is logged out");
    }
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    await redisClient.set(context.token, "Blacklisted", { EX: 1800 });
    return true;
  },
};
