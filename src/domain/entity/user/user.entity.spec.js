import {
  comparePassword,
  encryptPassword,
} from "../../../helpers/password-hash.js";
import { User } from "./user.entity.js";

describe("User Entity", () => {
  it("should create a user with valid properties", () => {
    const user = User.create({
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
    });

    expect(user).toMatchObject({
      id: expect.any(String),
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it("should throw an error when creating a user with invalid properties", () => {
    const user = User.create({
      name: "",
      email: "",
      password: "",
    });

    expect(user.isValid()).toBeFalsy();
    expect(user.errors).toHaveLength(3);
    expect(user.errors).toMatchObject([
      {
        message: "Name is required",
        entity: "User",
        context: { field: "name", value: "" },
      },
      {
        message: "Valid email is required",
        entity: "User",
        context: { field: "email", value: "" },
      },
      {
        message: "Password is required",
        entity: "User",
        context: { field: "password" },
      },
    ]);
  });

  it("should encrypt and compare password correctly", () => {
    const user = User.create({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      password: "password123",
    });

    user.encryptPassword(encryptPassword);

    expect(user.password).not.toBe("password123");
    expect(user.comparePassword(comparePassword, "password123")).toBe(true);
  });
});
