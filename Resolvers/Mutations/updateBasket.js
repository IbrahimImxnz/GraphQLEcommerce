const ProductType = require("../../Payloads/productType");
const { GraphQLString, GraphQLID, GraphQLNonNull } = require("graphql");
const checkToken = require("../../util/checkToken");
const Users = require("../../models/users");
const Products = require("../../models/products");

exports.addToBasket = {
  type: ProductType,
  description: "Add a product to user basket",
  args: {
    name: { type: GraphQLNonNull(GraphQLString) },
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
    const user = await Users.findById(context.user.id);
    const product = await Products.findOne({
      name: args.name,
      manager: args.manager,
    });
    if (!user) {
      throw new Error("User does not exist");
    }
    if (!product) {
      throw new Error("Product does not exist");
    }
    if (product.count === 0) {
      throw new Error("Product out of stock");
    }

    await Users.findByIdAndUpdate(context.user.id, {
      $push: { basket: product._id },
    });

    await Products.findByIdAndUpdate(product._id, {
      $inc: { count: -1 },
    });
    return product;
  },
};

exports.removeFromBasket = {
  type: ProductType,
  description: "Remove a product from user basket",
  args: {
    name: { type: GraphQLNonNull(GraphQLString) },
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
    const product = await Products.findOne({
      name: args.name,
    });
    if (!user) {
      throw new Error("User does not exist");
    }
    if (!product) {
      throw new Error("Product does not exist");
    }

    await Users.findByIdAndUpdate(context.user.id, {
      $pull: { basket: product._id },
    });

    await Products.findByIdAndUpdate(product._id, {
      $inc: { count: +1 },
    });
    return product;
  },
};
