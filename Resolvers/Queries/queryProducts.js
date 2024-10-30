const ProductType = require("../../Payloads/productType");
const Users = require("../../models/users");
const Products = require("../../models/products");
const { GraphQLID, GraphQLList, GraphQLNonNull } = require("graphql");
const checkToken = require("../../util/checkToken");

exports.products = {
  type: new GraphQLList(ProductType),
  description: "All products of a manager",
  args: {
    manager: { type: GraphQLNonNull(GraphQLID) },
  },
  async resolve(parent, args, context) {
    const tokenStatus = await checkToken(context.token);
    if (!tokenStatus) {
      throw new Error("User is logged out");
    }
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    return Products.find({ manager: args.manager });
  },
};

exports.basket = {
  type: new GraphQLList(ProductType),
  description: "User basket",
  async resolve(parent, args, context) {
    const tokenStatus = await checkToken(context.token);
    if (!tokenStatus) {
      throw new Error("User is logged out");
    }
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    const user = await Users.findById(context.user.id).populate("basket");
    if (!user) {
      throw new Error("User not found");
    }

    return user.basket;
  },
};
