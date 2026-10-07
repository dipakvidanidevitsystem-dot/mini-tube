import { eq, and, gt } from "drizzle-orm";
import dayjs from "dayjs";
import { db } from "../db/index.js";
import { passwordResets } from "../db/schema.js";

type NewPasswordReset = typeof passwordResets.$inferInsert;

class PasswordResetRepository {
  async findValidByTokenHash(tokenHash: string) {
    const [resetRow] = await db
      .select()
      .from(passwordResets)
      .where(and(eq(passwordResets.tokenHash, tokenHash), gt(passwordResets.expiresAt, dayjs().toDate())));
    return resetRow;
  }

  async deleteForUser(userId: number) {
    await db.delete(passwordResets).where(eq(passwordResets.userId, userId));
  }

  async create(data: NewPasswordReset) {
    await db.insert(passwordResets).values(data);
  }
}

export { PasswordResetRepository };
export const passwordResetRepository = new PasswordResetRepository();
