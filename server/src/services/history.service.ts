import { watchHistoryRepository, type WatchHistoryRepository } from "../repositories/watchHistory.repository.js";

class HistoryService {
  constructor(private readonly watchHistoryRepository: WatchHistoryRepository) {}

  async recordView(userId: number, videoId: number) {
    const existing = await this.watchHistoryRepository.find(userId, videoId);
    if (existing) {
      await this.watchHistoryRepository.touch(existing.id);
    } else {
      await this.watchHistoryRepository.create(userId, videoId);
    }
  }

  async listForUser(userId: number) {
    return this.watchHistoryRepository.listForUser(userId);
  }

  async removeItem(userId: number, videoId: number) {
    await this.watchHistoryRepository.removeForUser(userId, videoId);
  }

  async clear(userId: number) {
    await this.watchHistoryRepository.clearForUser(userId);
  }
}

export { HistoryService };
export const historyService = new HistoryService(watchHistoryRepository);
