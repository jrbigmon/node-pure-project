export class BaseException extends Error {
  #statusCode;
  #name;

  constructor(message, statusCode, name, context = {}) {
    super(message);
    this.#name = name;
    this.#statusCode = statusCode;
    this.context = context;
  }

  get statusCode() {
    return this.#statusCode;
  }

  get name() {
    return this.#name;
  }
}
