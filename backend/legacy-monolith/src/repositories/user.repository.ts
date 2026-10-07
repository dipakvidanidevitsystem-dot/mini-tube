import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

// Every business use of this table has moved to Auth/User/Admin Service —
// the monolith keeps only what its own migrations-route auth check needs.
class UserRepository {
  async findAuthSnapshotById(id: number) {
    const [user] = await db
      .select({ id: users.id, role: users.role, disabled: users.disabled })
      .from(users)
      .where(eq(users.id, id));
    return user;
  }
}

export { UserRepository };
export const userRepository = new UserRepository();
