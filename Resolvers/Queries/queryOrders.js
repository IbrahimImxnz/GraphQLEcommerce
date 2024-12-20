const Orders = require("../../models/orders");
const Users = require("../../models/users");
const OrderType = require("../../Payloads/orderType");
const checkToken = require("../../util/checkToken");

exports.personalOrders = {
  type: OrderType,
  description: "View user orders",
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
    return Orders.find({ userCharged: user._id });
  },
};

exports.AllOrders = {
  type: OrderType,
  description: "View all orders",
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
    if (user.role !== "admin") {
      throw new Error("User is not an admin");
    }

    return Orders.find();
  },
};
