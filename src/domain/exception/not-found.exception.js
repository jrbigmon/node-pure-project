import { BaseException } from "./base.exception.js";

export class NotFoundException extends BaseException {
  constructor(message, context = {}) {
    super(message, 404, "NotFoundException", context);
  }
}
