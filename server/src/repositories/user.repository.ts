import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

class UserRepository {
  async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async findAuthSnapshotById(id: number) {
    const [user] = await db
      .select({ id: users.id, role: users.role, disabled: users.disabled })
      .from(users)
      .where(eq(users.id, id));
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

  async create(data: NewUser) {
    const [result] = await db.insert(users).values(data);
    return this.findById(result.insertId) as Promise<User>;
  }

  async update(id: number, data: Partial<NewUser>) {
    await db.update(users).set(data).where(eq(users.id, id));
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
