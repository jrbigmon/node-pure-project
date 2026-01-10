import { EntityException } from "../../exception/entity.exception";
import { NotFoundException } from "../../exception/not-found.exception";

export const getUserUseCase = (userRepository) => async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    return new NotFoundException("User not found", {
      errors: [
        new EntityException({
          message: "No user found with the given ID",
          entity: "User",
          context: { userId },
        }),
      ],
    });
  }

  return user;
};
