const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLNonNull,
  GraphQLFloat,
} = require("graphql");

const ProductType = new GraphQLObjectType({
  name: "Product",
  description: "This represents a product",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLNonNull(GraphQLString) },
    count: { type: GraphQLNonNull(GraphQLInt) },
    manager: { type: GraphQLNonNull(GraphQLID) },
    price: { type: GraphQLNonNull(GraphQLFloat) },
  }),
});

module.exports = ProductType;
