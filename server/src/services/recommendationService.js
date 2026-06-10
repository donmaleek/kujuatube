import { listVideos } from "./videoProcessingService.js";

export function getRecommendations(videoId, limit = 8) {
  return listVideos({ sort: "views" })
    .filter((video) => video.id !== videoId)
    .slice(0, limit);
}
