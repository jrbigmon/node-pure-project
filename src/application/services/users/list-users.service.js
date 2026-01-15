export const listUsersService =
  ({ userRepository, useCase }) =>
  async () => {
    const response = await useCase(userRepository)();

    return response.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  };
