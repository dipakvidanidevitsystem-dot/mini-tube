import { Router, type NextFunction, type Request, type Response } from "express";
import { socketService } from "./socket.service.js";

// Called only by other backend services (never by the client), to relay a
// domain event as a Socket.IO push. Secured with a shared secret instead of
// user JWTs since these are service-to-service calls.
function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.INTERNAL_API_KEY;
  if (expected && req.headers["x-internal-key"] !== expected) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

const router = Router();
router.use(requireInternalKey);

router.post("/broadcast/video/:videoId", (req, res) => {
  const videoId = Number(req.params.videoId);
  const { event, payload } = req.body as { event: string; payload: unknown };
  socketService.broadcastToVideo(videoId, event, payload);
  res.status(204).end();
});

router.post("/broadcast/user/:userId", (req, res) => {
  const userId = Number(req.params.userId);
  const { event, payload } = req.body as { event: string; payload: unknown };
  socketService.broadcastToUser(userId, event, payload);
  res.status(204).end();
});

export default router;
