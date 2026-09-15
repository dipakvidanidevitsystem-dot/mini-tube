import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { writeFile, readFile, unlink } from "node:fs/promises";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

const ffmpegPath = ffmpegStatic as unknown as string | null;
import { CloudinaryService } from "../utils/cloudinary.js";
import { socketService, type SocketService } from "../sockets/socket.service.js";
import { videoRepository, type VideoRepository } from "../repositories/video.repository.js";
import { userRepository, type UserRepository } from "../repositories/user.repository.js";
import { mailerService, type MailerService } from "../utils/mailer.js";
import { videoUploadedEmail } from "../templates/emails.js";

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);
if (ffprobeStatic?.path) ffmpeg.setFfprobePath(ffprobeStatic.path);

function watchUrl(videoId: number) {
  return `${process.env.CLIENT_URL}/watch/${videoId}`;
}

async function transcodeToMp4(inputPath: string, outputPath: string) {
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-movflags", "faststart", "-pix_fmt", "yuv420p"])
      .on("error", reject)
      .on("end", () => resolve())
      .save(outputPath);
  });
}

async function probeDuration(inputPath: string) {
  return new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);
      resolve(Math.round(metadata.format.duration ?? 0));
    });
  });
}

async function extractThumbnail(inputPath: string, outputDir: string, filename: string) {
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .on("error", reject)
      .on("end", () => resolve())
      .screenshots({
        count: 1,
        timestamps: ["1"],
        filename,
        folder: outputDir,
        size: "1280x720",
      });
  });
}

class VideoProcessingService {
  constructor(
    private readonly videoRepository: VideoRepository,
    private readonly userRepository: UserRepository,
    private readonly socketService: SocketService,
    private readonly mailerService: MailerService
  ) {}

  async processAsync(
    videoId: number,
    uploaderId: number,
    videoBuffer: Buffer,
    thumbnailBuffer: Buffer | undefined
  ) {
    const jobId = randomUUID();
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `${jobId}-input.mp4`);
    const outputPath = path.join(tempDir, `${jobId}-output.mp4`);
    const thumbnailFilename = `${jobId}-thumb.jpg`;
    const generatedThumbnailPath = path.join(tempDir, thumbnailFilename);

    try {
      await writeFile(inputPath, videoBuffer);
      const [, duration] = await Promise.all([
        transcodeToMp4(inputPath, outputPath),
        probeDuration(inputPath).catch(() => 0),
      ]);

      let resolvedThumbnailBuffer = thumbnailBuffer;
      let generatedThumbnail = false;
      if (!resolvedThumbnailBuffer) {
        await extractThumbnail(inputPath, tempDir, thumbnailFilename);
        resolvedThumbnailBuffer = await readFile(generatedThumbnailPath);
        generatedThumbnail = true;
      }

      const transcodedBuffer = await readFile(outputPath);

      const [videoUpload, thumbnailUpload] = await Promise.all([
        CloudinaryService.uploadStream(transcodedBuffer, { resourceType: "video", folder: "minitube/videos" }),
        CloudinaryService.uploadStream(resolvedThumbnailBuffer, {
          resourceType: "image",
          folder: "minitube/thumbnails",
        }),
      ]);

      await this.videoRepository.update(videoId, {
        videoUrl: videoUpload.secure_url,
        thumbnailUrl: thumbnailUpload.secure_url,
        duration,
        processingStatus: "ready",
        processingError: null,
      });

      const video = await this.videoRepository.findById(videoId);
      const uploader = await this.userRepository.findById(uploaderId);
      if (uploader?.notifyVideoUploaded && video) {
        this.mailerService.sendMailFireAndForget({
          to: uploader.email,
          ...videoUploadedEmail(uploader.name, video.title, watchUrl(video.id)),
        });
      }

      this.socketService.broadcastToUser(uploaderId, "video-ready", { videoId, video });
      this.socketService.broadcastToVideo(videoId, "video-ready", { videoId, video });

      await this.cleanup(inputPath, outputPath, generatedThumbnail ? generatedThumbnailPath : undefined);
    } catch (err) {
      console.error("Video processing failed:", err);
      const message = err instanceof Error ? err.message : "Video processing failed";

      await this.videoRepository
        .update(videoId, { processingStatus: "failed", processingError: message })
        .catch(() => {});

      this.socketService.broadcastToUser(uploaderId, "video-failed", { videoId, message });

      await this.cleanup(inputPath, outputPath, generatedThumbnailPath);
    }
  }

  private async cleanup(...paths: (string | undefined)[]) {
    await Promise.all(
      paths.filter((p): p is string => Boolean(p)).map((p) => unlink(p).catch(() => {}))
    );
  }
}

export { VideoProcessingService };
export const videoProcessingService = new VideoProcessingService(
  videoRepository,
  userRepository,
  socketService,
  mailerService
);
