const AuthPayloadType = require("../../Payloads/authPayload");
const { GraphQLString, GraphQLInt, GraphQLNonNull } = require("graphql");
const Users = require("../../models/users");
const { generateAccessToken } = require("../../util/jwtAuthenticator");
const bcrypt = require("bcrypt");

exports.addUser = {
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
};

exports.login = {
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
};
