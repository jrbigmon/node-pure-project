export const getUsersUseCase = (userRepository) => async () => {
  return await userRepository.findAll();
};
