import { User } from "../../entity/user/user.entity";
import { BadRequestException } from "../../exception/bad-request.exception";
import { createUserUseCase } from "./create-user.usecase";
import jest from "jest-mock";

describe("createUserUseCase", () => {
  let userRepository = {
    save: jest.fn(),
    existsByEmail: jest.fn(),
  };

  test("should create a user successfully", async () => {
    const user = await createUserUseCase(userRepository)({
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
    });

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("john.doe@example.com");
  });

  test("should not create a user with existing email", async () => {
    userRepository.existsByEmail.mockResolvedValueOnce(true);

    const response = await createUserUseCase(userRepository)({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      password: "password123",
    });

    expect(response).toBeInstanceOf(BadRequestException);
    expect(response.message).toBe("Email already exists");
  });

  test("should not create a user with invalid data", async () => {
    const response = await createUserUseCase(userRepository)({
      name: "",
      email: "invalid-email",
      password: "123",
    });

    expect(response).toBeInstanceOf(BadRequestException);
    expect(response.message).toBe("Invalid user data");
  });
});
