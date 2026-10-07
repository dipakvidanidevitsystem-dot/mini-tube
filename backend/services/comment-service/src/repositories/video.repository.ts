import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { videos } from "../db/schema.js";

// Comment Service only ever reads a video's owner/title to decide who to
// notify — Video Service stays the sole writer of this table.
class VideoRepository {
  async findById(id: number) {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }
}

export { VideoRepository };
export const videoRepository = new VideoRepository();
