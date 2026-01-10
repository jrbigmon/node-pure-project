import { encryptPassword } from "../../../helpers/password-hash.js";
import { User } from "../../entity/user/user.entity.js";
import { EntityException } from "../../exception/entity.exception.js";
import { BadRequestException } from "../../exception/bad-request.exception.js";

export const createUserUseCase =
  (userRepository) =>
  async ({ name, email, password }) => {
    const user = User.create({ name, email, password });

    if (!user.isValid()) {
      return new BadRequestException("Invalid user data", {
        errors: user.errors,
      });
    }

    const exists = await userRepository.existsByEmail(user.email);

    if (exists) {
      return new BadRequestException("Email already exists", {
        errors: [
          new EntityException({
            message: "Email already exists",
            entity: "User",
            context: { field: "email", value: user.email },
          }),
        ],
      });
    }

    user.encryptPassword(encryptPassword);

    await userRepository.save(user);

    return user;
  };
