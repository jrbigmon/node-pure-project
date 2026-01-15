export class BaseException extends Error {
  #statusCode;
  #name;
  #context;

  constructor(message, statusCode, name, context = {}) {
    super(message);
    this.#name = name;
    this.#statusCode = statusCode;
    this.#context = context;
  }

  get statusCode() {
    return this.#statusCode;
  }

  get name() {
    return this.#name;
  }

  get context() {
    return this.#context;
  }

  toJSON() {
    return {
      name: this.#name,
      statusCode: this.#statusCode,
      message: this.message,
      context: this.#context,
    };
  }
}
