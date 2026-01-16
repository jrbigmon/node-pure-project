export class UserRepository {
  constructor(database) {
    this.database = database;
  }

  save() {
    throw new Error("Method not implemented.");
  }

  findById(_id) {
    throw new Error("Method not implemented.");
  }

  findAll() {
    throw new Error("Method not implemented.");
  }

  existsByEmail(_email) {
    throw new Error("Method not implemented.");
  }
}
