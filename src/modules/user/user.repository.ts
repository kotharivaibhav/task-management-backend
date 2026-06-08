

import type { IEmployee, IUser } from "./user.model.ts";
import User, { Employee } from "./user.model.ts";
import BaseRepository from "../../helpers/mongo/base.repository.ts"


class UserRepository extends BaseRepository<IUser | IEmployee> {
  constructor() {
    super(User);
  }

  // create custom methods for user repository
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findByName(name: string): Promise<IUser | null> {
    return User.findOne({ name });
  }

}

export default UserRepository;


export class EmployeeRepository extends BaseRepository<IEmployee> {
  constructor() {
    super(Employee);
  }

  async findByUserId(userId: string): Promise<IEmployee | null> {
    return this.model.findOne({ userId }).exec();
  }
}
