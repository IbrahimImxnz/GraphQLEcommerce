const { GraphQLObjectType, GraphQLSchema } = require("graphql");
require("dotenv").config();
const redis = require("redis");
const { user, users, managers } = require("../Resolvers/Queries/queryUsers");
const { products, basket } = require("../Resolvers/Queries/queryProducts");
const { Checkout } = require("../Resolvers/Queries/queryCheckout");
const {
  personalOrders,
  AllOrders,
} = require("../Resolvers/Queries/queryOrders");
const { addEmail } = require("../Resolvers/Mutations/addEmail");
const { addUser, login } = require("../Resolvers/Mutations/loginRegister");
const { update, changeRole } = require("../Resolvers/Mutations/updateUser");
const { deleteUser } = require("../Resolvers/Mutations/deleteUser");
const { addProduct } = require("../Resolvers/Mutations/addProduct");
const {
  addToBasket,
  removeFromBasket,
} = require("../Resolvers/Mutations/updateBasket");
const {
  changeProductDetails,
} = require("../Resolvers/Mutations/updateProduct");
const { Payment } = require("../Resolvers/Mutations/payment");
const { refundPayment } = require("../Resolvers/Mutations/refund");
const { Logout } = require("../Resolvers/Mutations/logout");

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  description: "Root Query",
  fields: () => ({
    user,
    users,
    managers,
    products,
    basket,
    Checkout,
    personalOrders,
    AllOrders,
  }),
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  description: "Mutation",
  fields: () => ({
    addEmail,
    addUser,
    login,
    update,
    changeRole,
    deleteUser,
    addProduct,
    addToBasket,
    removeFromBasket,
    changeProductDetails,
    Payment,
    refundPayment,
    Logout,
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
// module.exports = redisClient;

/*
module.exports = {
  schema: new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
  }),
  redisClient,
};*/
