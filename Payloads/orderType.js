const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLBoolean,
} = require("graphql");

exports.OrderType = new GraphQLObjectType({
  name: "Order",
  description: "This represents an order",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    transactionId: { type: GraphQLNonNull(GraphQLString) },
    userCharged: { type: GraphQLNonNull(GraphQLID) },
    amount: { type: GraphQLNonNull(GraphQLFloat) },
    refunded: { type: GraphQLBoolean },
  }),
});
