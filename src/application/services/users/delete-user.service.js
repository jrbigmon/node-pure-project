import { BaseException } from "../../../domain/exception/base.exception.js";

export const deleteUserService =
  ({ userRepository, useCase }) =>
  async ({ id }) => {
    const response = await useCase(userRepository)({ id });

    if (response instanceof BaseException) {
      throw response;
    }
  };
