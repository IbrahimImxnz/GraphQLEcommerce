const PaymentPayload = require("../../Payloads/paymentPayload");
const { GraphQLString, GraphQLNonNull } = require("graphql");
const checkToken = require("../../util/checkToken");
const Users = require("../../models/users");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const sendOrderConfirmation = require("../../util/sendOrderConfirmation");

exports.Payment = {
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
};
