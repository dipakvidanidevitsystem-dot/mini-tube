import { db } from "../db/index.js";
import { reports } from "../db/schema.js";

type NewReport = typeof reports.$inferInsert;

// Admin's moderation queue (list/markReviewed, with joins to users/videos)
// stays owned by the still-monolithic admin domain — Video Service only ever
// creates reports.
class ReportRepository {
  async create(data: NewReport) {
    await db.insert(reports).values(data);
  }
}

export { ReportRepository };
export const reportRepository = new ReportRepository();
