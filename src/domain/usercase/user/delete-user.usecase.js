import { EntityException } from "../../exception/entity.exception.js";
import { NotFoundException } from "../../exception/not-found.exception.js";

export const deleteUserUseCase =
  (userRepository) =>
  async ({ id }) => {
    const user = await userRepository.findById(id);

    if (!user) {
      return new NotFoundException("User not found", {
        errors: [
          new EntityException({
            message: "No user found with the given ID",
            entity: "User",
            context: { id },
          }),
        ],
      });
    }

    await userRepository.delete(id);
  };
