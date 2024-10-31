const { GraphQLString, GraphQLInt, GraphQLNonNull } = require("graphql");
const UserType = require("../../Payloads/userType");
const checkToken = require("../../util/checkToken");
const Users = require("../../models/users");
require("dotenv").config();

exports.update = {
  type: UserType,
  description: "update",
  args: {
    username: { type: GraphQLString },
    password: { type: GraphQLString },
    email: { type: GraphQLString },
    code: { type: GraphQLInt },
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
};

exports.changeRole = {
  type: UserType,
  description: "Change user role",
  args: {
    role: { type: GraphQLNonNull(GraphQLString) },
    adminCode: { type: GraphQLString },
    productDescription: { type: GraphQLString },
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
};
