import jest from "jest-mock";
import { getUserUseCase } from "./get-user.usecase.js";
import { User } from "../../entity/user/user.entity.js";
import { NotFoundException } from "../../exception/not-found.exception.js";

describe("getUserUseCase", () => {
  let userRepository = {
    findById: jest.fn().mockResolvedValue(
      new User({
        id: "123",
        name: "John Doe",
        email: "john.doe@example.com",
        password: "hashedpassword",
      })
    ),
  };

  it("should get a user by ID", async () => {
    const user = await getUserUseCase(userRepository)("123");

    expect(user).toBeInstanceOf(User);
    expect(user).toMatchObject({
      id: "123",
      name: "John Doe",
      email: "john.doe@example.com",
    });
  });

  it("should return NotFoundException if user does not exist", async () => {
    userRepository.findById.mockResolvedValueOnce(null);

    const result = await getUserUseCase(userRepository)("999");

    expect(result).toBeInstanceOf(NotFoundException);
    expect(result.message).toBe("User not found");
  });
});
