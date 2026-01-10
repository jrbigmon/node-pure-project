export class UserRepository {
  constructor(database) {
    this.database = database;
  }

  save() {
    throw new Error("Method not implemented.");
  }

  findById(id) {
    throw new Error("Method not implemented.");
  }

  findAll() {
    throw new Error("Method not implemented.");
  }

  existsByEmail(email) {
    throw new Error("Method not implemented.");
  }
}
