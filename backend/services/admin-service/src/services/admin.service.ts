import { HttpError } from "../utils/HttpError.js";
import { userRepository, type UserRepository } from "../repositories/user.repository.js";
import { videoRepository, type VideoRepository } from "../repositories/video.repository.js";
import { commentRepository, type CommentRepository } from "../repositories/comment.repository.js";
import { reportRepository, type ReportRepository } from "../repositories/report.repository.js";

class AdminService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly videoRepository: VideoRepository,
    private readonly commentRepository: CommentRepository,
    private readonly reportRepository: ReportRepository
  ) {}

  async listUsers() {
    return this.userRepository.list();
  }

  async setUserDisabled(id: number, disabled: boolean) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new HttpError(404, "User not found");
    if (user.role === "admin") {
      throw new HttpError(400, "Admin accounts cannot be disabled");
    }

    await this.userRepository.setDisabled(id, disabled);
    return { id, disabled };
  }

  async listVideos() {
    return this.videoRepository.listAllWithCreatorSummary();
  }

  async listComments() {
    return this.commentRepository.listAllWithAuthor();
  }

  async listReports() {
    return this.reportRepository.list();
  }

  async markReportReviewed(id: number) {
    const report = await this.reportRepository.findById(id);
    if (!report) throw new HttpError(404, "Report not found");

    await this.reportRepository.markReviewed(id);
    return { id, status: "reviewed" };
  }
}

export { AdminService };
export const adminService = new AdminService(userRepository, videoRepository, commentRepository, reportRepository);
