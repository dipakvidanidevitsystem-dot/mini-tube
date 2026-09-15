import { eq, and, gte, sql, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { subscriptions, users } from "../db/schema.js";

class SubscriptionRepository {
  async find(subscriberId: number, channelId: number) {
    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.subscriberId, subscriberId), eq(subscriptions.channelId, channelId)));
    return existing;
  }

  async create(subscriberId: number, channelId: number) {
    await db.insert(subscriptions).values({ subscriberId, channelId });
  }

  async delete(id: number) {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }

  async countForChannel(channelId: number) {
    const [{ subscriberCount }] = await db
      .select({ subscriberCount: sql<number>`count(*)`.mapWith(Number) })
      .from(subscriptions)
      .where(eq(subscriptions.channelId, channelId));
    return subscriberCount;
  }

  async countGainedSince(channelId: number, since: Date) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(subscriptions)
      .where(and(eq(subscriptions.channelId, channelId), gte(subscriptions.createdAt, since)));
    return count;
  }

  async topSubscribers(channelId: number, limit: number) {
    return db
      .select({
        id: users.id,
        name: users.name,
        profileImage: users.profileImage,
        subscribedAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.subscriberId, users.id))
      .where(eq(subscriptions.channelId, channelId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(limit);
  }

  async recentForChannel(channelId: number, limit: number) {
    return db
      .select({
        actorId: users.id,
        actorName: users.name,
        actorImage: users.profileImage,
        createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.subscriberId, users.id))
      .where(eq(subscriptions.channelId, channelId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(limit);
  }
}

export { SubscriptionRepository };
export const subscriptionRepository = new SubscriptionRepository();
