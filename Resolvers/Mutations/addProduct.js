const {
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLFloat,
} = require("graphql");
const ProductType = require("../../Payloads/productType");
const checkToken = require("../../util/checkToken");
const Users = require("../../models/users");
const Products = require("../../models/products");

exports.addProduct = {
  type: ProductType,
  description: "Add a new product",
  args: {
    name: { type: GraphQLNonNull(GraphQLString) },
    count: { type: GraphQLNonNull(GraphQLInt) },
    price: { type: GraphQLNonNull(GraphQLFloat) },
  },
  async resolve(parent, args, context) {
    const tokenStatus = await checkToken(context.token);
    if (!tokenStatus) {
      throw new Error("User is logged out");
    }
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    const user = await Users.findById(context.user.id);
    if (!user) {
      throw new Error("User does not exist");
    }
    if (user.role !== "manager") {
      throw new Error("Cannot add a product as a non manager");
    }
    const product = await Products.create({
      name: args.name,
      count: args.count,
      manager: context.user.id,
      price: args.price,
    });
    return product;
  },
};
