import { updateVideoStatus } from "../services/videoProcessingService.js";
import { encodeVideo } from "../utils/videoEncoder.js";

export async function runVideoTranscodeJob(video) {
  updateVideoStatus(video.id, "processing");
  const result = await encodeVideo({ videoId: video.id, sourceUrl: video.videoUrl });
  updateVideoStatus(video.id, "ready");
  return result;
}
