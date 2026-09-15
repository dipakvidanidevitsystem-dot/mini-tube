import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

type User = typeof users.$inferSelect;

// Read-only except setDisabled (moderation) — Auth/User Service own the rest
// of the writes to this table.
class UserRepository {
  async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async setDisabled(id: number, disabled: boolean) {
    await db.update(users).set({ disabled }).where(eq(users.id, id));
  }

  async list() {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        disabled: users.disabled,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);
  }
}

export { UserRepository };
export const userRepository = new UserRepository();
