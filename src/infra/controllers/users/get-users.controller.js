import { UserService } from "../../../application/services/users/index.js";
import { getUsersUseCase } from "../../../domain/usercase/user/get-users.usecase.js";
import databaseMemory from "../../database/db.memory.js";
import { UserMemoryRepository } from "../../repository/user/user.memory.repository.js";

export const getUsersController = async (_req, res) => {
  const users = await UserService.findAll({
    userRepository: new UserMemoryRepository(databaseMemory),
    useCase: getUsersUseCase,
  })();

  res.writeHeader(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(users));
};
