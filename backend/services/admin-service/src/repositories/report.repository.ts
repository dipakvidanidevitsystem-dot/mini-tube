import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { reports, videos, users } from "../db/schema.js";

class ReportRepository {
  async findById(id: number) {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async markReviewed(id: number) {
    await db.update(reports).set({ status: "reviewed" }).where(eq(reports.id, id));
  }

  async list() {
    return db
      .select({
        id: reports.id,
        videoId: reports.videoId,
        videoTitle: videos.title,
        reporterId: reports.reporterId,
        reporterName: users.name,
        reason: reports.reason,
        status: reports.status,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .innerJoin(videos, eq(reports.videoId, videos.id))
      .innerJoin(users, eq(reports.reporterId, users.id))
      .orderBy(desc(reports.createdAt));
  }
}

export { ReportRepository };
export const reportRepository = new ReportRepository();
