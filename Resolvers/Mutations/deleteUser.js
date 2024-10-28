const { GraphQLString, GraphQLNonNull } = require("graphql");
const UserType = require("../../Payloads/userType");
const checkToken = require("../../util/checkToken");
const Users = require("../../models/users");

exports.deleteUser = {
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
};
