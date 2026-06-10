import path from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { assertProductionEnv, env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/logger.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import creatorRoutes from "./routes/creatorRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import liveStreamRoutes from "./routes/liveStreamRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import trendingRoutes from "./routes/trendingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";

assertProductionEnv();
const app = express();

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(cors({ origin: env.corsOrigin.split(","), credentials: true }));
app.use(requestLogger);
app.use(rateLimiter());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(env.uploadDir)));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "kujuatime-server",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/creator", creatorRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/trending", trendingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/live", liveStreamRoutes);

app.use(notFound);
app.use(errorHandler);

const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isEntryPoint) {
  app.listen(env.port, () => {
    console.log(`KujuaTime API listening on port ${env.port}`);
  });
}

export default app;
