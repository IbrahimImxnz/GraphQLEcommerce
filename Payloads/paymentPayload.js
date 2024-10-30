const { GraphQLObjectType, GraphQLString, GraphQLFloat } = require("graphql");

const PaymentPayload = new GraphQLObjectType({
  name: "PaymentPayload",
  fields: () => ({
    status: { type: GraphQLString },
    transactionId: { type: GraphQLString },
    amount: { type: GraphQLFloat },
  }),
});

module.exports = PaymentPayload;
