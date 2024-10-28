const { GraphQLObjectType, GraphQLString, GraphQLFloat } = require("graphql");

exports.PaymentPayload = new GraphQLObjectType({
  name: "PaymentPayload",
  fields: () => ({
    status: { type: GraphQLString },
    transactionId: { type: GraphQLString },
    amount: { type: GraphQLFloat },
  }),
});
