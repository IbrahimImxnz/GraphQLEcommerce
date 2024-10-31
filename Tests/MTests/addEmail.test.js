const { addEmail } = require("../../Resolvers/Mutations/addEmail");
const sendMail = require("../../util/sendEmail");
const Users = require("../../models/users");

jest.mock("../../models/users");
jest.mock("../../util/sendEmail");

describe("add Email resolver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("email not used before", async () => {
    const mockUser = {
      email: "user@gmail.com",
    };
    Users.findOne.mockResolvedValue({ email: mockUser.email });
    const args = {
      email: "user@gmail.com",
    };

    await expect(addEmail.resolve(null, args)).rejects.toThrow(
      "Email already used"
    );
  });

  test("user created with inputted email and generated code", async () => {
    Users.findOne.mockResolvedValue(null); // to make sure database does not have email
    const args = {
      email: "user@gmail.com",
    };
    Users.updateOne.mockResolvedValue({});
    await addEmail.resolve(null, args);
    expect(Users.updateOne).toHaveBeenCalledWith(
      { email: args.email },
      expect.objectContaining({
        code: expect.any(Number),
        codeExpiration: expect.any(Number),
      }),
      { upsert: true }
    );

    expect(sendMail).toHaveBeenCalledWith(args.email, expect.any(Number));
  });
});
