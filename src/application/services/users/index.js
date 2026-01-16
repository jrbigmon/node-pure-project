import { createUserService } from "./create-user.service.js";
import { getUserService } from "./get-user.service.js";
import { listUsersService } from "./list-users.service.js";

export const UserService = {
  create: createUserService,
  findAll: listUsersService,
  findById: getUserService,
};
