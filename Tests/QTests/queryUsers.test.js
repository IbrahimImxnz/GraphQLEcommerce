const { user, users, managers } = require("../../Resolvers/Queries/queryUsers");
const Users = require("../../models/users");
const checkToken = require("../../util/checkToken");

jest.mock("../../models/users");
jest.mock("../../util/checkToken");

describe("Single user query resolver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("User is logged out", async () => {
    checkToken.mockResolvedValue(false);

    const context = {
      token: "blacklistedToken",
    };
    await expect(user.resolve(null, null, context)).rejects.toThrow(
      "User is logged out"
    );
  });

  test("User not existing", async () => {
    checkToken.mockResolvedValue(true);
    Users.findById.mockResolvedValue(null);
    context = {
      user: { id: "0" },
    };
    await expect(user.resolve(null, null, context)).rejects.toThrow(
      "User not found"
    );
  });

  test("User is not an admin", async () => {
    checkToken.mockResolvedValue(true);
    const mockUser = {
      id: "0",
      username: "user0",
      email: "user0@gmail.com",
      role: "user",
    };
    Users.findById.mockResolvedValue(mockUser);
    await expect(user.resolve(null, null, context)).rejects.toThrow(
      "User is not an admin"
    );
  });

  test("Query user", async () => {
    checkToken.mockResolvedValue(true);
    const mockUser = {
      id: "0",
      username: "user0",
      email: "user0@gmail.com",
      role: "user",
    };
    const mockAdmin = {
      id: "1",
      username: "user1",
      email: "user1@gmail.com",
      role: "admin",
    };
    Users.findById.mockResolvedValue(mockAdmin);
    Users.findOne.mockResolvedValue(mockUser);

    const args = { id: "0" };
    const context = { token: "validToken", user: { id: "1" } };

    const result = await user.resolve(null, args, context);
    expect(result).toEqual(mockUser);
    expect(Users.findOne).toHaveBeenCalledWith({ id: args.id });
  });
});

describe("All users query resolver", () => {
  // need to create mock database (list)
  const mockUsers = [
    { id: "2", username: "user2" },
    { id: "3", username: "user3" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("User is logged out", async () => {
    checkToken.mockResolvedValue(false);

    const context = {
      token: "blacklistedToken",
    };
    await expect(users.resolve(null, null, context)).rejects.toThrow(
      "User is logged out"
    );
  });

  test("User not existing", async () => {
    checkToken.mockResolvedValue(true);
    Users.findById.mockResolvedValue(null);
    context = {
      user: { id: "0" },
    };
    await expect(users.resolve(null, null, context)).rejects.toThrow(
      "User not found"
    );
  });

  test("User is not an admin", async () => {
    checkToken.mockResolvedValue(true);
    const mockUser = {
      id: "0",
      username: "user0",
      email: "user0@gmail.com",
      role: "user",
    };
    Users.findById.mockResolvedValue(mockUser);
    await expect(users.resolve(null, {}, context)).rejects.toThrow(
      "User is not an admin"
    );
  });

  test("Query users", async () => {
    checkToken.mockResolvedValue(true);
    const mockAdmin = {
      id: "1",
      username: "user1",
      email: "user1@gmail.com",
      role: "admin",
    };
    Users.findById.mockResolvedValue(mockAdmin);
    Users.find.mockResolvedValue(mockUsers);

    const context = { token: "validToken", user: { id: "1" } };

    const result = await users.resolve(null, null, context);
    expect(Users.find).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });
});

describe("Query managers", () => {
  const mockUsers = [
    { id: "2", username: "user2", role: "manager", productDescription: "test" },
    { id: "3", username: "user3", role: "manager", productDescription: "test" },
    { id: "4", username: "user4", role: "user" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Query managers", async () => {
    Users.find.mockResolvedValue(mockUsers);
    const result = await managers.resolve();
    expect(Users.find).toHaveBeenCalledWith({ role: "manager" });
    expect(result).toEqual(mockUsers);
  });
});
