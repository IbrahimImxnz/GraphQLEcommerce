const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");

const Users = require("../models/users");

const UserType = new GraphQLObjectType({
  name: "User",
  description: "This represents a user",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    username: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
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
    addUser: {
      type: UserType,
      description: "Register",
      args: {
        username: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        let user = Users.create({
          username: args.username,
          email: args.email,
          password: args.password,
        });
        return user;
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
