import type { Server as HttpServer } from "http";
import { Server as IOServer, type Socket } from "socket.io";
import { TokenService } from "../utils/jwt.js";
import { userRepository, type UserRepository } from "../repositories/user.repository.js";

interface SocketUser {
  id: number;
  role: "user" | "admin";
}

interface SocketData {
  user?: SocketUser;
}

type AppSocket = Socket<Record<string, never>, Record<string, never>, Record<string, never>, SocketData>;

function userRoom(userId: number) {
  return `user:${userId}`;
}

function videoRoom(videoId: number) {
  return `video:${videoId}`;
}

type AppIOServer = IOServer<Record<string, never>, Record<string, never>, Record<string, never>, SocketData>;

class SocketService {
  private io: AppIOServer | undefined;

  constructor(private readonly userRepository: UserRepository) {}

  init(httpServer: HttpServer) {
    this.io = new IOServer(httpServer, {
      cors: { origin: process.env.CLIENT_URL, credentials: true },
    });

    this.io.use(this.authenticate);
    this.io.on("connection", this.handleConnection);

    return this.io;
  }

  private authenticate = async (socket: AppSocket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next();

    try {
      const payload = TokenService.verify(token);
      const user = await this.userRepository.findAuthSnapshotById(payload.id);
      if (user && !user.disabled) {
        socket.data.user = { id: user.id, role: user.role };
      }
    } catch {
      // invalid/expired token — allow the connection anonymously, same as optionalAuthenticate
    }
    next();
  };

  private handleConnection = (socket: AppSocket) => {
    const user = socket.data.user;
    if (user) socket.join(userRoom(user.id));

    socket.on("join-video", (videoId: number) => {
      if (Number.isFinite(Number(videoId))) socket.join(videoRoom(Number(videoId)));
    });

    socket.on("leave-video", (videoId: number) => {
      if (Number.isFinite(Number(videoId))) socket.leave(videoRoom(Number(videoId)));
    });
  };

  broadcastToVideo(videoId: number, event: string, payload: unknown) {
    this.io?.to(videoRoom(videoId)).emit(event, payload);
  }

  broadcastToUser(userId: number, event: string, payload: unknown) {
    this.io?.to(userRoom(userId)).emit(event, payload);
  }

  invalidateDashboard(userId: number) {
    this.broadcastToUser(userId, "dashboard-invalidate", {});
  }
}

export { SocketService };
export const socketService = new SocketService(userRepository);
