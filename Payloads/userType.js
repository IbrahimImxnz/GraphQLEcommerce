const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
} = require("graphql");
const Users = require("../models/users");
const ProductType = require("../Payloads/productType");

const UserType = new GraphQLObjectType({
  name: "User",
  description: "This represents a user",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    username: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    role: { type: GraphQLString },
    basket: {
      type: new GraphQLList(ProductType),
      async resolve(parent, args, context) {
        const user = await Users.findById(context.user.id).populate("basket");
        return user.basket;
      },
    },
    sum: {
      type: GraphQLFloat,
      async resolve(parent, args, context) {
        const user = await Users.findById(context.user.id).populate("basket");
        const basket = user.basket;
        const total = basket.reduce((sum, item) => sum + item.price, 0);
        return total;
      },
    },
    productDescription: { type: GraphQLString },
  }),
});

module.exports = UserType;
