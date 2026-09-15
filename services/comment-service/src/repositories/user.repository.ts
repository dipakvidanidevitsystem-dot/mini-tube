import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

type User = typeof users.$inferSelect;

// Comment Service only ever reads a video owner's email/notification prefs —
// User Service stays the sole writer of this table.
class UserRepository {
  async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
}

export { UserRepository };
export const userRepository = new UserRepository();
