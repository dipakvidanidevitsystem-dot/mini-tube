import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createRateLimiter } from "@mini-tube/security-middleware";
import { socketService } from "./socket.service.js";
import internalRoutes from "./internal.routes.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(createRateLimiter());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "notification-service" }));
app.use("/internal", internalRoutes);

const httpServer = http.createServer(app);
socketService.init(httpServer);

const PORT = process.env.PORT || 5017;
httpServer.listen(PORT, () => {
  console.log(`notification-service listening on port ${PORT}`);
});
