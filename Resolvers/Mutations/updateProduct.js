const ProductType = require("../../Payloads/productType");
const {
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLFloat,
} = require("graphql");
const checkToken = require("../../util/checkToken");
const Users = require("../../models/users");
const Products = require("../../models/products");

exports.changeProductDetails = {
  type: ProductType,
  description: "Add a new product",
  args: {
    name: { type: GraphQLNonNull(GraphQLString) },
    count: { type: GraphQLInt },
    price: { type: GraphQLFloat },
  },
  async resolve(parent, args, context) {
    checkToken(context.token);
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
    const product = await Products.findOne({ name: args.name });
    if (!product) {
      throw new Error("Product does not exist!");
    }
    if (args.count) product.count = args.count;
    if (args.price) product.price = args.price;
    await product.save();
    return product;
  },
};
