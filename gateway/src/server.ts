import "dotenv/config";
import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

registerRoutes(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT}`);
});
