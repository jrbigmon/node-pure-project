import { UserRepository } from "../../../domain/repository/user/user.repository.js";

export class UserMemoryRepository extends UserRepository {
  constructor(database) {
    super(database);
  }

  save(user) {
    return new Promise((resolve) => {
      this.database.users.set(user.id, user);
      resolve();
    });
  }

  findById(userId) {
    return new Promise((resolve) => {
      const user = this.database.users.get(userId);
      resolve(user ?? null);
    });
  }

  existsByEmail(email) {
    return new Promise((resolve) => {
      const user = Array.from(this.database.users.values()).find(
        (user) => user.email === email
      );
      resolve(user ?? null);
    });
  }

  findAll() {
    return new Promise((resolve) => {
      const users = Array.from(this.database.users.values());
      resolve(users);
    });
  }
}
