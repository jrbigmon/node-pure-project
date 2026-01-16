import { BaseException } from "../../../domain/exception/base.exception.js";

export const getUserService =
  ({ userRepository, useCase }) =>
  async ({ id }) => {
    const response = await useCase(userRepository)({ id });

    if (response instanceof BaseException) {
      throw response;
    }

    return {
      id: response.id,
      name: response.name,
      email: response.email,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  };
