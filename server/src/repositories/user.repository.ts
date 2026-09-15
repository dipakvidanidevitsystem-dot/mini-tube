import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

type User = typeof users.$inferSelect;

// User Service owns this table's profile fields for real now (Auth Service
// owns credentials) — the monolith keeps only what its own admin domain and
// auth middleware still need directly against the shared DB.
class UserRepository {
  async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async findAuthSnapshotById(id: number) {
    const [user] = await db
      .select({ id: users.id, role: users.role, disabled: users.disabled })
      .from(users)
      .where(eq(users.id, id));
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
