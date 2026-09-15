import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

type User = typeof users.$inferSelect;

// Video Service only ever reads users (to notify an owner or resolve a
// creator's email/name) — User Service stays the sole writer of this table.
class UserRepository {
  async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
}

export { UserRepository };
export const userRepository = new UserRepository();
