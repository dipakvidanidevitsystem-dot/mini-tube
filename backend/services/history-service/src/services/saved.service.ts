import { savedVideoRepository, type SavedVideoRepository } from "../repositories/savedVideo.repository.js";

class SavedService {
  constructor(private readonly savedVideoRepository: SavedVideoRepository) {}

  async toggle(userId: number, videoId: number) {
    const existing = await this.savedVideoRepository.find(userId, videoId);

    if (existing) {
      await this.savedVideoRepository.delete(existing.id);
    } else {
      await this.savedVideoRepository.create(userId, videoId);
    }

    return { saved: !existing };
  }

  async listForUser(userId: number) {
    return this.savedVideoRepository.listForUser(userId);
  }
}

export { SavedService };
export const savedService = new SavedService(savedVideoRepository);
