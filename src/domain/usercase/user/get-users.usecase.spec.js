import { User } from "../../entity/user/user.entity.js";
import { getUsersUseCase } from "./get-users.usecase.js";
import jest from "jest-mock";

describe("getUsersUseCase", () => {
  let userRepository = {
    findAll: jest.fn(),
  };

  it("should retrieve all users from the repository", async () => {
    const mockedUsers = [
      new User({
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        password: "hashedpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new User({
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: "hashedpassword2",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];

    userRepository.findAll.mockResolvedValueOnce(mockedUsers);

    const users = await getUsersUseCase(userRepository)();
    expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    expect(users).toHaveLength(2);
    expect(users).toMatchObject(mockedUsers);
  });
});
