import { getUsersController } from "./get-users.controller.js";
import { createUserController } from "./create-user.controller.js";
import { getUserController } from "./get-user.controller.js";

export const UserController = {
  "(GET)/users/:id": getUserController,
  "(GET)/users": getUsersController,
  "(POST)/users": createUserController,
};
