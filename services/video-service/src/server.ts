import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "video-service" }));

// TODO: mount routes extracted from server/src/routes/* for this service's domain
// per the migration plan (services/video-service owns its own tables + Drizzle schema).

const PORT = process.env.PORT || 5013;
app.listen(PORT, () => {
  console.log(`video-service listening on port ${PORT}`);
});
