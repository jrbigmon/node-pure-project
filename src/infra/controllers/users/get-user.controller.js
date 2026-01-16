import { UserService } from "../../../application/services/users/index.js";
import { getUserUseCase } from "../../../domain/usercase/user/get-user.usecase.js";
import databaseMemory from "../../database/db.memory.js";
import { UserMemoryRepository } from "../../repository/user/user.memory.repository.js";

export const getUserController = async (req, res) => {
  const { id = "" } = req.params ?? {};

  const user = await UserService.findById({
    userRepository: new UserMemoryRepository(databaseMemory),
    useCase: getUserUseCase,
  })({ id });

  res.writeHeader(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(user));
};
