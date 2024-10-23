const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  graphql,
} = require("graphql");
const { generateAccessToken } = require("../util/jwtAuthenticator");
const bcrypt = require("bcrypt");
const Users = require("../models/users");
const sendMail = require("../util/sendEmail");
const UserType = new GraphQLObjectType({
  name: "User",
  description: "This represents a user",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    username: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const AuthPayloadType = new GraphQLObjectType({
  name: "AuthPayload",
  description: "Authentication payload with user data and token",
  fields: () => ({
    user: { type: UserType },
    token: { type: GraphQLString },
  }),
});

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
      resolve: (parent, args) => Users.findById(args.id),
    },
    users: {
      type: new GraphQLList(UserType),
      description: "All Users",
      resolve: (parent, args) => Users.find(),
    },
  }),
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  description: "Mutation",
  fields: () => ({
    addEmail: {
      type: UserType,
      description: "Add new email for registration",
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
        useranme: { type: GraphQLString },
        password: { type: GraphQLString },
        email: { type: GraphQLString },
      },
      async resolve(parent, args, context) {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
