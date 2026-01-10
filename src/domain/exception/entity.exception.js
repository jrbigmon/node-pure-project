export class EntityException {
  constructor({ message, entity, context }) {
    this.message = message;
    this.entity = entity;
    this.context = context;
  }

  get fullMessage() {
    return `[${this.entity}]: ${this.message} ${
      this.context ? `| Context: ${JSON.stringify(this.context)}` : ""
    }`;
  }
}
