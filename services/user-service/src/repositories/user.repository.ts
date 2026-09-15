import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

// User Service owns profile fields on `users` (name, avatar, notification
// prefs, password). Credentials issuance stays with Auth Service, which
// keeps its own copy of this table for register/login/reset-password.
class UserRepository {
  async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async findProfileById(id: number) {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        profileImage: users.profileImage,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async update(id: number, data: Partial<NewUser>) {
    await db.update(users).set(data).where(eq(users.id, id));
  }
}

export { UserRepository };
export const userRepository = new UserRepository();
