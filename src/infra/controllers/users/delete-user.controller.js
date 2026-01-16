import { UserService } from "../../../application/services/users/index.js";
import { deleteUserUseCase } from "../../../domain/usercase/user/delete-user.usecase.js";
import databaseMemory from "../../database/db.memory.js";
import { UserMemoryRepository } from "../../repository/user/user.memory.repository.js";

export const deleteUserController = async (req, res) => {
  const { id } = req.params ?? {};

  await UserService.delete({
    userRepository: new UserMemoryRepository(databaseMemory),
    useCase: deleteUserUseCase,
  })({ id });

  res.writeHead(204);
  res.end();
};
