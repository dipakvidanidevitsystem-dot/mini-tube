import type { Server as HttpServer } from "http";
import { Server as IOServer, type Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface SocketData {
  userId?: number;
}

type AppSocket = Socket<Record<string, never>, Record<string, never>, Record<string, never>, SocketData>;
type AppIOServer = IOServer<Record<string, never>, Record<string, never>, Record<string, never>, SocketData>;

function userRoom(userId: number) {
  return `user:${userId}`;
}

function videoRoom(videoId: number) {
  return `video:${videoId}`;
}

class SocketService {
  private io: AppIOServer | undefined;

  init(httpServer: HttpServer) {
    this.io = new IOServer(httpServer, {
      cors: { origin: process.env.CLIENT_URL, credentials: true },
    });

    this.io.use(this.authenticate);
    this.io.on("connection", this.handleConnection);

    return this.io;
  }

  // Verifies the JWT signature only (no user-service lookup for `disabled`/role) —
  // acceptable staleness per the migration plan until Auth Service embeds those
  // claims directly in the token.
  private authenticate = (socket: AppSocket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next();

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
      socket.data.userId = payload.id;
    } catch {
      // invalid/expired token — allow the connection anonymously, same as before
    }
    next();
  };

  private handleConnection = (socket: AppSocket) => {
    const userId = socket.data.userId;
    if (userId) socket.join(userRoom(userId));

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
}

export { SocketService };
export const socketService = new SocketService();
