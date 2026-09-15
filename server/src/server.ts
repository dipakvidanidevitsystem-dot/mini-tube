import "dotenv/config";
import http from "node:http";
import type { Express } from "express";
import app from "./app.js";
import { socketService } from "./sockets/socket.service.js";

class Server {
  private readonly httpServer: http.Server;

  constructor(
    private readonly app: Express,
    private readonly port: string | number
  ) {
    this.httpServer = http.createServer(this.app);
    socketService.init(this.httpServer);
  }

  listen() {
    this.httpServer.listen(this.port, () => {
      console.log(`MiniTube API listening on port ${this.port}`);
    });
  }
}

export { Server };

const server = new Server(app, process.env.PORT || 5001);
server.listen();
