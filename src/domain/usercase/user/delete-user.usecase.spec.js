import jest from "jest-mock";
import { User } from "../../entity/user/user.entity.js";
import { deleteUserUseCase } from "./delete-user.usecase.js";
import { NotFoundException } from "../../exception/not-found.exception.js";

describe("deleteUserUseCase", () => {
  let userRepository = {
    findById: jest.fn().mockResolvedValue(
      new User({
        id: "123",
        name: "John Doe",
        email: "john.doe@example.com",
        password: "hashedpassword",
      })
    ),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  it("should delete a user by ID", async () => {
    const result = await deleteUserUseCase(userRepository)({ id: "123" });
    expect(result).toBeUndefined();
    expect(userRepository.delete).toHaveBeenCalledWith("123");
  });

  it("should return NotFoundException if user does not exist", async () => {
    userRepository.findById.mockResolvedValueOnce(null);

    const result = await deleteUserUseCase(userRepository)({ id: "999" });

    expect(result).toBeInstanceOf(NotFoundException);
    expect(result.message).toBe("User not found");
  });
});
