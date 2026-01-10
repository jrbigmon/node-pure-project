import { BaseException } from "./base.exception.js";

export class BadRequestException extends BaseException {
  constructor(message, context = {}) {
    super(message, 400, "BadRequestException", context);
  }
}
