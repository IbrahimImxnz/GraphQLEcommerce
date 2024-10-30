const { GraphQLObjectType, GraphQLList, GraphQLFloat } = require("graphql");
const ProductType = require("./productType");

const CheckoutPayload = new GraphQLObjectType({
  name: "CheckoutPayload",
  fields: () => ({
    basket: { type: GraphQLList(ProductType) },
    sum: { type: GraphQLFloat },
  }),
});

module.exports = CheckoutPayload;
