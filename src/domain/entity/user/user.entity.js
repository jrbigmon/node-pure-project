import { generateUUID } from "../../../helpers/uuid.js";
import { EntityException } from "../../exception/entity.exception.js";

export class User {
  #id;
  #name;
  #email;
  #password;
  #createdAt;
  #updatedAt;
  #errors = [];

  constructor({ id, name, email, password, createdAt, updatedAt }) {
    this.#id = id;
    this.#name = name.trim();
    this.#email = email.trim().toLowerCase();
    this.#password = password.trim();
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get email() {
    return this.#email;
  }

  get password() {
    return this.#password;
  }

  get createdAt() {
    return this.#createdAt;
  }

  get updatedAt() {
    return this.#updatedAt;
  }

  get errors() {
    return this.#errors;
  }

  isValid() {
    if (!this.#name) {
      this.#errors.push(
        new EntityException({
          message: "Name is required",
          entity: "User",
          context: { field: "name", value: this.#name },
        })
      );
    }

    if (!this.#email || !this.#email.includes("@")) {
      this.#errors.push(
        new EntityException({
          message: "Valid email is required",
          entity: "User",
          context: { field: "email", value: this.#email },
        })
      );
    }

    if (!this.#password) {
      this.#errors.push(
        new EntityException({
          message: "Password is required",
          entity: "User",
          context: { field: "password" },
        })
      );
    }

    return this.#errors.length === 0;
  }

  encryptPassword(encryptFunction) {
    this.#password = encryptFunction(this.#password);
  }

  comparePassword(compareFunction, plainPassword) {
    return compareFunction(this.#password, plainPassword);
  }

  static create({ name, email, password }) {
    return new User({
      id: generateUUID(),
      name,
      email,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
