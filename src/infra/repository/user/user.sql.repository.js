import { UserRepository } from "../../../domain/repository/user/user.repository";

export class UserSQLRepository extends UserRepository {
  constructor(database) {
    super(database);
  }
}
