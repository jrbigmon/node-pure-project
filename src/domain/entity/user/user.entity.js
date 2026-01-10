import { generateUUID } from "../../../helpers/uuid.js";
import { EntityException } from "../../exception/entity.exception.js";

export class User {
  #id;
  #name;
  #email;
  #password;
  #errors = [];

  constructor({ id, name, email, password }) {
    this.#id = id;
    this.#name = name.trim();
    this.#email = email.trim().toLowerCase();
    this.#password = password.trim();
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

  static create({ name, email, password }) {
    return new User({ id: generateUUID(), name, email, password });
  }
}
