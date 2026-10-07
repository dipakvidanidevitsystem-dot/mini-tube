import axios from "axios";

// Same pattern as server/src/sockets/socket.service.ts: Socket.IO lives in
// the standalone notification-service, so this just relays events over HTTP.

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5017";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

class SocketService {
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
