const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  graphql,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLBoolean,
} = require("graphql");
const { generateAccessToken } = require("../util/jwtAuthenticator");
require("dotenv").config();
const bcrypt = require("bcrypt");
const Users = require("../models/users");
const Products = require("../models/products");
const sendMail = require("../util/sendEmail");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const redis = require("redis");
const Orders = require("../models/orders");
const sendOrderConfirmation = require("../util/sendOrderConfirmation");

const redisClient = redis.createClient(process.env.REDIS_URL);

(async () => {
  await redisClient.connect();
})();

redisClient.on("ready", () => {
  console.log("Redis connected");
});

redisClient.on("error", (err) => {
  console.log(err);
});

const checkToken = async (token) => {
  if (!token) {
    throw new Error("Unauthorized");
  }

  const isBlacklisted = await redisClient.get(token);
  if (isBlacklisted) {
    throw new Error("Token is blacklisted");
  }
};

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  description: "Root Query",
  fields: () => ({
    user: {
      type: UserType,
      description: "A single User",
      args: {
        id: { type: GraphQLID },
      },
      async resolve(parent, args, context) {
        checkToken(context.token);
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        const user = await Users.findById(context.user.id);
        if (!user) {
          throw new Error("User not found");
        }
        if (user.role !== "admin") {
          throw new Error("User is not an admin");
        }

        return Users.findOne({ id: args.id });
      },
    },
    users: {
      type: new GraphQLList(UserType),
      description: "All Users",
      async resolve(parent, args, context) {
        checkToken(context.token);
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        const user = await Users.findById(context.user.id);
        if (!user) {
          throw new Error("User not found");
        }
        if (user.role !== "admin") {
          throw new Error("User is not an admin");
        }

        return Users.find();
      },
    },
    managers: {
      type: new GraphQLList(UserType),
      description: "List of managers",
      resolve: (parent, args) =>
        Users.find({ role: "manager" }).select("username productDescription"),
    },
    products: {
      type: new GraphQLList(ProductType),
      description: "All products of a manager",
      args: {
        manager: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args, context) {
        checkToken(context.token);
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        return Products.find({ manager: args.manager });
      },
    },
    basket: {
      type: new GraphQLList(ProductType),
      description: "User basket",
      async resolve(parent, args, context) {
        checkToken(context.token);
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        const user = await Users.findById(context.user.id).populate("basket");
        if (!user) {
          throw new Error("User not found");
        }

        return user.basket;
      },
    },
    Checkout: {
      type: CheckoutPayload,
      description: "User checkout",
      async resolve(parent, args, context) {
        checkToken(context.token);
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        const user = await Users.findById(context.user.id).populate("basket");
        const basket = user.basket;
        const total = basket.reduce((sum, item) => sum + item.price, 0);

        return {
          basket: basket,
          sum: total,
        };
      },
    },
    personalOrders: {
      type: OrderType,
      description: "View user orders",
      async resolve(parent, args, context) {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        const user = await Users.findById(context.user.id);
        if (!user) {
          throw new Error("User not found");
        }
        return Orders.find({ userCharged: user._id });
      },
    },
    AllOrders: {
      type: OrderType,
      description: "View all orders",
      async resolve(parent, args, context) {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        const user = await Users.findById(context.user.id);
        if (!user) {
          throw new Error("User not found");
        }
        if (user.role !== "admin") {
          throw new Error("User is not an admin");
        }

        return Orders.find();
      },
    },
  }),
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  description: "Mutation",
  fields: () => ({
    addEmail: {
      type: UserType,
      description: "Add new email for registration or updating",
      args: {
        email: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const user = await Users.findOne({ email: args.email });
        if (user) {
          throw new Error("Email already used");
        }
        const randomCode = Math.floor(10000000 + Math.random() * 90000000); // 8 digit code
        // let newEmail = args.email;
        await Users.updateOne(
          { email: args.email },
          { code: randomCode, codeExpiration: Date.now() + 1800000 },
          { upsert: true }
        );
        sendMail(args.email, randomCode);
      },
    },
    addUser: {
      type: AuthPayloadType,
      description: "Register",
      args: {
        username: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        code: { type: GraphQLNonNull(GraphQLInt) },
      },
      async resolve(parent, args) {
        const user = await Users.findOne({ email: args.email });
        if (!user) {
          throw new Error("Email not verified");
        }
        if (args.code != user.code || user.codeExpiration < Date.now()) {
          throw new Error("Code invalid or expired");
        }
        user.username = args.username;
        user.password = args.password;
        await user.save();

        const accessToken = generateAccessToken({ id: user._id });
        return {
          user: user,
          token: accessToken,
        };
      },
    },
    login: {
      type: AuthPayloadType,
      description: "Login",
      args: {
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const user = await Users.findOne({
          email: args.email,
        });

        if (!user) throw new Error("Invalid credentials");
        const compare = await bcrypt.compare(args.password, user.password);

        if (compare) {
          const accessToken = generateAccessToken({ id: user._id });
          return {
            user: user,
            token: accessToken,
          };
        } else {
          throw new Error("Invalid credentials");
        }
      },
    },
    update: {
      type: UserType,
      description: "update",
      args: {
        username: { type: GraphQLString },
        password: { type: GraphQLString },
        email: { type: GraphQLString },
        code: { type: GraphQLInt },
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

        if (args.username) {
          user.username = args.username;
        }
        if (args.password) {
          user.password = args.password;
        }
        if (args.email) {
          if (
            args.code != user.code ||
            user.codeExpiration < Date.now() ||
            !args.code
          ) {
            throw new Error("Code is invalid or expired");
          } else {
            user.email = args.email;
          }
        }
        await user.save();
        return user;
      },
    },
    changeRole: {
      type: UserType,
      description: "Change user role",
      args: {
        role: { type: GraphQLNonNull(GraphQLString) },
        adminCode: { type: GraphQLString },
        productDescription: { type: GraphQLString },
      },
      async resolve(parent, args, context) {
        checkToken(context.token);
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        const user = await Users.findById(context.user.id);
        if (!user) {
          throw new Error("User not found");
        }

        if (args.role === "manager") {
          user.role = args.role;
          user.productDescription = args.productDescription;
        } else if (args.role === "admin") {
          if (args.adminCode != process.env.ADMIN || !args.adminCode) {
            throw new Error("Incorrect admin code");
          }
          user.role = args.role;
        } else {
          throw new Error("This role is inexistent");
        }
        await user.save();
        return user;
      },
    },
    addProduct: {
      type: ProductType,
      description: "Add a new product",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        count: { type: GraphQLNonNull(GraphQLInt) },
        price: { type: GraphQLNonNull(GraphQLFloat) },
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
        const product = await Products.create({
          name: args.name,
          count: args.count,
          manager: context.user.id,
          price: args.price,
        });
        return product;
      },
    },
    changeProductDetails: {
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
    },
    addToBasket: {
      type: ProductType,
      description: "Add a product to user basket",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        manager: { type: GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, args, context) {
        checkToken(context.token);
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
    },
    removeFromBasket: {
      type: ProductType,
      description: "Remove a product from user basket",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args, context) {
        checkToken(context.token);
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
    },
    Payment: {
      type: PaymentPayload,
      description: "Payment after checkout",
      args: {
        token: { type: GraphQLNonNull(GraphQLString) }, // usually generated on the frontend
      },
      async resolve(parent, args, context) {
        checkToken(context.token);
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        const user = await Users.findById(context.user.id).populate("basket");
        const basket = user.basket;
        const total = basket.reduce((sum, item) => sum + item.price, 0);

        try {
          const charge = await stripe.charges.create({
            amount: Math.round(total * 100),
            currency: "eur",
            source: args.token, // for testing use tok_visa
            description: `${user.email} is charged with ${total} EUR`,
          });

          await Orders.create({
            transactionId: charge.id,
            userCharged: user._id,
            amount: total,
          });
          console.log("new order added");

          sendOrderConfirmation(user.email, charge.id);

          return {
            status: charge.status,
            transactionId: charge.id,
            amount: total,
          };
        } catch (err) {
          throw new Error(err.message);
        }
      },
    },
    Logout: {
      type: GraphQLBoolean,
      description: "Blacklist token when logging out",
      async resolve(parent, args, context) {
        checkToken(context.token);
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        await redisClient.set(context.token, "Blacklisted", { EX: 1800 });
        return true;
      },
    },
    deleteUser: {
      type: UserType,
      description: "Admin deletes user",
      args: {
        email: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args, context) {
        checkToken(context.token);
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        const user = await Users.findById(context.user.id);
        if (!user) {
          throw new Error("User not found");
        }
        if (user.role !== "admin") {
          throw new Error("User is not an admin");
        }
        const deletedUser = await Users.findOne({ email: args.email });
        if (!deletedUser) {
          throw new Error("User does not exist");
        }
        await deletedUser.remove();
      },
    },
    refundPayment: {
      type: GraphQLBoolean,
      description: "Refund a payment to its purchaser",
      args: {
        transactionId: { type: GraphQLNonNull(GraphQLString) },
        reason: { type: GraphQLString },
      },
      async resolve(parent, args, context) {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        const user = await Users.findById(context.user.id);
        if (!user) {
          throw new Error("User not found");
        }
        if (user.role !== "admin") {
          throw new Error("User is not a admin");
        }
        const order = await Orders.findOne({
          transactionId: args.transactionId,
        });
        try {
          const refund = await stripe.refunds.create({
            charge: args.transactionId,
            reason: args.reason,
          });

          order.refunded = true;
          await order.save();

          return refund.status === "succeeded";
        } catch (err) {
          throw new Error(err.message);
        }
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
