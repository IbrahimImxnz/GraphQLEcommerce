const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    userCharged: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    amount: {
      type: Number,
      required: true,
    },
    refunded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Orders", orderSchema);
