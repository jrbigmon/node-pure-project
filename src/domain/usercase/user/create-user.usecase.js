import { User } from "../../entity/user/user.entity.js";
import { EntityException } from "../../exception/entity.exception.js";

export const createUserUseCase = async (
  { name, email, password },
  userRepository
) => {
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

  await userRepository.save(user);

  return user;
};
