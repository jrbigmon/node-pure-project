import bcrypt from "bcryptjs";

const encryptPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

const comparePassword = (hashedPassword, plainPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

export { encryptPassword, comparePassword };
