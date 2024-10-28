const UserType = require("../../Payloads/userType");
const { GraphQLID, GraphQLList } = require("graphql");
const Users = require("../../models/users");
const checkToken = require("../../util/checkToken");

exports.user = {
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
};

exports.users = {
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
};

exports.managers = {
  type: new GraphQLList(UserType),
  description: "List of managers",
  resolve: (parent, args) =>
    Users.find({ role: "manager" }).select("username productDescription"),
};
