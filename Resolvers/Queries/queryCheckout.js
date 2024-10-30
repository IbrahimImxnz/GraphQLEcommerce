const Users = require("../../models/users");
const CheckoutPayload = require("../../Payloads/checkoutPayload");
const checkToken = require("../../util/checkToken");

exports.Checkout = {
  type: CheckoutPayload,
  description: "User checkout",
  async resolve(parent, args, context) {
    const tokenStatus = await checkToken(context.token);
    if (!tokenStatus) {
      throw new Error("User is logged out");
    }
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
};
