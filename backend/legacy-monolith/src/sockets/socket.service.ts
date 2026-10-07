import axios from "axios";

// Socket.IO now runs in the standalone notification-service (migration plan
// step 2) instead of in-process. This class keeps the same public interface
// so every call site (video/comment/user/videoProcessing services) is
// unchanged — only the transport moved from in-memory to HTTP.

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5017";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

class SocketService {
  init() {
    // no-op: the notification-service hosts its own HTTP + Socket.IO server
  }

  private post(path: string, body: unknown) {
    axios
      .post(`${NOTIFICATION_SERVICE_URL}${path}`, body, {
        headers: INTERNAL_API_KEY ? { "x-internal-key": INTERNAL_API_KEY } : undefined,
      })
      .catch((err) => {
        console.error(`notification-service request failed (${path}):`, err.message);
      });
  }

  broadcastToVideo(videoId: number, event: string, payload: unknown) {
    this.post(`/internal/broadcast/video/${videoId}`, { event, payload });
  }

  broadcastToUser(userId: number, event: string, payload: unknown) {
    this.post(`/internal/broadcast/user/${userId}`, { event, payload });
  }

  invalidateDashboard(userId: number) {
    this.broadcastToUser(userId, "dashboard-invalidate", {});
  }
}

export { SocketService };
export const socketService = new SocketService();
