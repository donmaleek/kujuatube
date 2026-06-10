import { socketBus } from "./index.js";

export function publishViewCount(videoId, views) {
  socketBus.emit("view", {
    videoId,
    views,
    emittedAt: new Date().toISOString()
  });
}
