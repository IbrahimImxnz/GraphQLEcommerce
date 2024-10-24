const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    code: Number,
    codeExpiration: Date,
    role: {
      type: String,
      enum: ["user", "admin", "manager"],
      default: "user",
    },
    basket: [{ type: mongoose.Types.ObjectId, ref: "Products" }],
    sum: Number,
    productDescription: String,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("Users", userSchema);
