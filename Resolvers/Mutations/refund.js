const { GraphQLString, GraphQLNonNull, GraphQLBoolean } = require("graphql");
const Users = require("../../models/users");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

exports.refundPayment = {
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
};
