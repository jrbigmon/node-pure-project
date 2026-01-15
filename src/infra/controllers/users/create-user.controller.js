import { UserMemoryRepository } from "../../repository/user/user.memory.repository.js";
import databaseMemory from "../../database/db.memory.js";
import { createUserUseCase } from "../../../domain/usercase/user/create-user.usecase.js";
import { UserService } from "../../../application/services/users/index.js";

export const createUserController = async (req, res) => {
  const { name = "", email = "", password = "" } = req.body ?? {};

  const user = await UserService.create({
    userRepository: new UserMemoryRepository(databaseMemory),
    useCase: createUserUseCase,
  })({ name, email, password });

  res.writeHeader(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify(user));
};
