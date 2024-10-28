const { GraphQLObjectType, GraphQLList, GraphQLFloat } = require("graphql");
const ProductType = require("./productType");

exports.CheckoutPayload = new GraphQLObjectType({
  name: "CheckoutPayload",
  fields: () => ({
    basket: { type: GraphQLList(ProductType) },
    sum: { type: GraphQLFloat },
  }),
});
