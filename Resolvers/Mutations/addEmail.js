const UserType = require("../../Payloads/userType");
const { GraphQLString, GraphQLNonNull } = require("graphql");
const Users = require("../../models/users");
const sendMail = require("../../util/sendEmail");

exports.addEmail = {
  type: UserType,
  description: "Add new email for registration or updating",
  args: {
    email: { type: GraphQLNonNull(GraphQLString) },
  },
  async resolve(parent, args) {
    const user = await Users.findOne({ email: args.email });
    if (user) {
      throw new Error("Email already used");
    }
    const randomCode = Math.floor(10000000 + Math.random() * 90000000); // 8 digit code
    // let newEmail = args.email;
    await Users.updateOne(
      { email: args.email },
      { code: randomCode, codeExpiration: Date.now() + 1800000 },
      { upsert: true }
    );
    sendMail(args.email, randomCode);
  },
};
