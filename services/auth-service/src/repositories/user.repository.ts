import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

// Only the subset of user access auth (register/login/reset-password) needs.
// Profile-oriented queries (findProfileById, list, setDisabled, ...) stay
// owned by the still-monolithic user domain until User Service is extracted.
class UserRepository {
  async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async create(data: NewUser) {
    const [result] = await db.insert(users).values(data);
    return this.findById(result.insertId) as Promise<User>;
  }

  async update(id: number, data: Partial<NewUser>) {
    await db.update(users).set(data).where(eq(users.id, id));
  }
}

export { UserRepository };
export const userRepository = new UserRepository();
