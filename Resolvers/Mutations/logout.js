const { GraphQLBoolean } = require("graphql");
const checkToken = require("../../util/checkToken");
const redisClient = require("../../GQLSchemas/schema");

exports.Logout = {
  type: GraphQLBoolean,
  description: "Blacklist token when logging out",
  async resolve(parent, args, context) {
    checkToken(context.token);
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    await redisClient.set(context.token, "Blacklisted", { EX: 1800 });
    return true;
  },
};
