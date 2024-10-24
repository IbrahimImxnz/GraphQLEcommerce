const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      lowercase: true,
    },
    count: Number,
    manager: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Users",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", productSchema);
