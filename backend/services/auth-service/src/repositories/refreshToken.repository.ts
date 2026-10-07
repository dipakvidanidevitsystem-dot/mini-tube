import { eq, and, gt } from "drizzle-orm";
import dayjs from "dayjs";
import { db } from "../db/index.js";
import { refreshTokens } from "../db/schema.js";

type NewRefreshToken = typeof refreshTokens.$inferInsert;

class RefreshTokenRepository {
  async findValidByTokenHash(tokenHash: string) {
    const [tokenRow] = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.tokenHash, tokenHash), gt(refreshTokens.expiresAt, dayjs().toDate())));
    return tokenRow;
  }

  async create(data: NewRefreshToken) {
    await db.insert(refreshTokens).values(data);
  }

  async deleteByHash(tokenHash: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
  }

  async deleteForUser(userId: number) {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }
}

export { RefreshTokenRepository };
export const refreshTokenRepository = new RefreshTokenRepository();
