import { BaseException } from "../../../domain/exception/base.exception.js";

export const createUserService =
  ({ userRepository, useCase }) =>
  async ({ name, email, password }) => {
    const response = await useCase(userRepository)({
      name,
      email,
      password,
    });

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
