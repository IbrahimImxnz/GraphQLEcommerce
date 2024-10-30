const { GraphQLObjectType, GraphQLString } = require("graphql");
const UserType = require("./userType");

const AuthPayloadType = new GraphQLObjectType({
  name: "AuthPayload",
  description: "Authentication payload with user data and token",
  fields: () => ({
    user: { type: UserType },
    token: { type: GraphQLString },
  }),
});

module.exports = AuthPayloadType;
