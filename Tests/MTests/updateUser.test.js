const { update, changeRole } = require("../../Resolvers/Mutations/updateUser");
const Users = require("../../models/users");
const checkToken = require("../../util/checkToken");
require("dotenv").config();

jest.mock("../../models/users");
jest.mock("../../util/checkToken");

describe("update user credentials resolver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("User is logged out", async () => {
    checkToken.mockResolvedValue(false);

    const context = {
      token: "blacklistedToken",
    };
    await expect(update.resolve(null, null, context)).rejects.toThrow(
      "User is logged out"
    );
  });

  test("User not existing", async () => {
    checkToken.mockResolvedValue(true);
    Users.findById.mockResolvedValue(null);
    context = {
      user: { id: "0" },
    };
    await expect(update.resolve(null, null, context)).rejects.toThrow(
      "User does not exist"
    );
  });

  test("Updating user creds", async () => {
    checkToken.mockResolvedValue(true);
    const mockUser = {
      id: "0",
      username: "user0",
      email: "user0@gmail.com",
      code: 123456,
      codeExpiration: Date.now() + 1000000,
      save: jest.fn(),
    };

    // test case only if user wants to update username
    const args = {
      username: "user1",
    };
    const context = {
      token: "validToken",
      user: { id: "0" },
    };
    Users.findById.mockResolvedValue(mockUser);

    const result = await update.resolve(null, args, context);
    expect(mockUser.username).toBe(args.username);
    expect(mockUser.save).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  test("throws error if code is invalid or expired", async () => {
    checkToken.mockResolvedValue(true);
    const mockUser = {
      id: "0",
      username: "user0",
      email: "user0@gmail.com",
      code: 123456,
      codeExpiration: Date.now() - 1000000,
      save: jest.fn(),
    };
    const context = {
      token: "validToken",
      user: { id: "0" },
    };
    Users.findById.mockResolvedValue(mockUser);

    const args = { email: "user0@gmail.com", code: 123456 };

    await expect(update.resolve(null, args, context)).rejects.toThrow(
      "Code is invalid or expired"
    );
  });

  test("updates email if code is valid", async () => {
    checkToken.mockResolvedValue(true);
    const mockUser = {
      id: "0",
      username: "user0",
      email: "user0@gmail.com",
      code: 123456,
      codeExpiration: Date.now() + 1000000,
      save: jest.fn(),
    };
    const context = {
      token: "validToken",
      user: { id: "0" },
    };
    Users.findById.mockResolvedValue(mockUser);

    const args = { email: "user1@gmail.com", code: 123456 };

    const result = await update.resolve(null, args, context);

    expect(mockUser.email).toBe(args.email);
    expect(mockUser.save).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });
});

describe("Changing role resolver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // some functions have already been tested in previous describe so i will skip them (lower coverage however)
  test("Changing role to manager", async () => {
    checkToken.mockResolvedValue(true);
    const mockUser = {
      id: "0",
      username: "user0",
      email: "user0@gmail.com",
      code: 123456,
      codeExpiration: Date.now() + 1000000,
      role: "user",
      save: jest.fn(),
    };
    Users.findById.mockResolvedValue(mockUser);
    const context = {
      token: "validToken",
      user: { id: "0" },
    };
    const args = {
      role: "manager",
      productDescription: "test",
    };
    const result = await changeRole.resolve(null, args, context);

    expect(mockUser.role).toBe(args.role);
    expect(mockUser.productDescription).toBe(args.productDescription);
    expect(mockUser.save).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  test("Invalid or nonexistent admin code", async () => {
    checkToken.mockResolvedValue(true);
    const mockUser = {
      id: "0",
      username: "user0",
      email: "user0@gmail.com",
      code: 123456,
      codeExpiration: Date.now() + 1000000,
      role: "user",
      save: jest.fn(),
    };
    Users.findById.mockResolvedValue(mockUser);
    process.env.ADMIN = "code";

    const context = {
      token: "validToken",
      user: { id: "0" },
    };
    const args = {
      role: "admin",
      adminCode: "otherCode",
    };

    await expect(changeRole.resolve(null, args, context)).rejects.toThrow(
      "Incorrect admin code"
    );
  });

  test("Changing role to admin", async () => {
    checkToken.mockResolvedValue(true);
    const mockUser = {
      id: "0",
      username: "user0",
      email: "user0@gmail.com",
      code: 123456,
      codeExpiration: Date.now() + 1000000,
      role: "user",
      save: jest.fn(),
    };
    Users.findById.mockResolvedValue(mockUser);
    process.env.ADMIN = "code";
    const context = {
      token: "validToken",
      user: { id: "0" },
    };
    const args = {
      role: "admin",
      adminCode: "code",
    };
    const result = await changeRole.resolve(null, args, context);

    expect(mockUser.role).toBe(args.role);
    expect(mockUser.save).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });
});
