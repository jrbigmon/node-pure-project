import { getUsersController } from "./get-users.controller.js";
import { createUserController } from "./create-user.controller.js";

export const UserController = {
  "GET:/users": getUsersController,
  "POST:/users": createUserController,
};
