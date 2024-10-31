const { addUser, login } = require("../../Resolvers/Mutations/loginRegister");
const Users = require("../../models/users");
const bcrypt = require("bcrypt");
const { generateAccessToken } = require("../../util/jwtAuthenticator");

jest.mock("../../models/users");
jest.mock("bcrypt");
jest.mock("../../util/jwtAuthenticator");

describe("login Resolver", () => {
  // group login related tests
  beforeEach(() => {
    jest.clearAllMocks(); // reset all mocks before each test
  });

  test("login with valid creds", async () => {
    const mockUser = {
      _id: "user0",
      email: "user0@gmail.com",
      password: "$2b$12$orQRggIhRBkI55kZa/5WD.dpOpavET5T1OSAVYwS0AmTijpzFU0/6",
    };
    Users.findOne.mockResolvedValue(mockUser); // mock query to return mock user
    bcrypt.compare.mockResolvedValue(true); // mock bycrypt compare to return true
    generateAccessToken.mockReturnValue("mock_token");

    const args = {
      email: "user0@gmail.com",
      password: "1234",
    };
    // asserting functions
    const result = await login.resolve(null, args);
    expect(Users.findOne).toHaveBeenCalledWith({ email: args.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      args.password,
      mockUser.password
    );
    expect(result).toEqual({
      user: mockUser,
      token: "mock_token",
    });
  });

  test("if user not found", async () => {
    Users.findOne.mockResolvedValue(null);

    const args = {
      email: "blabla@gmail.com",
      password: "password",
    };

    await expect(login.resolve(null, args)).rejects.toThrow(
      "Invalid credentials"
    );
  });

  test("throws an error if password does not match", async () => {
    const mockUser = {
      _id: "user1",
      email: "user1@gmail.com",
      password: "$2b$12$orQRggIhRBkI55kZa/5WD.dpOpavET5T1OSAVYwS0AmTijpzFU0/6",
    };
    Users.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);
    const args = {
      email: "user1@gmail.com",
      password: "wrongpassword",
    };

    await expect(login.resolve(null, args)).rejects.toThrow(
      "Invalid credentials"
    );
  });
});

describe("addUser (Registration) Resolver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("registers a user if the email is verified and code is valid", async () => {
    const mockUser = {
      email: "user0@gmail.com",
      code: 123456,
      codeExpiration: Date.now() + 1000000,
      save: jest.fn(),
    };
    Users.findOne.mockResolvedValue(mockUser);
    bcrypt.hash.mockResolvedValue("hashed_password");
    generateAccessToken.mockReturnValue("mock_token");

    const args = {
      username: "user0",
      email: "user0@gmail.com",
      password: "password123",
      code: 123456,
    };

    const result = await addUser.resolve(null, args);
    expect(Users.findOne).toHaveBeenCalledWith({ email: args.email });
    expect(mockUser.save).toHaveBeenCalled();
    expect(result).toEqual({
      user: mockUser,
      token: "mock_token",
    });
  });

  test("throws an error if email is not verified", async () => {
    Users.findOne.mockResolvedValue(null);

    const args = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      code: 123456,
    };

    await expect(addUser.resolve(null, args)).rejects.toThrow(
      "Email not verified" // iser nonexistent
    );
  });

  test("throws an error if code is invalid or expired", async () => {
    const mockUser = {
      email: "test@example.com",
      code: 123456,
      codeExpiration: Date.now() - 1000, // Expired code
    };
    Users.findOne.mockResolvedValue(mockUser);

    const args = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      code: 123456,
    };

    await expect(addUser.resolve(null, args)).rejects.toThrow(
      "Code invalid or expired"
    );
  });
});
