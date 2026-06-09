import { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import CommentSection from "../components/video/CommentSection.jsx";
import RecommendedVideos from "../components/video/RecommendedVideos.jsx";
import WatchCompanion from "../components/video/WatchCompanion.jsx";
import VideoInfo from "../components/video/VideoInfo.jsx";
import VideoPlayer from "../components/video/VideoPlayer.jsx";
import VideoTikTokActions from "../components/video/VideoTikTokActions.jsx";
import { useVideo, useVideos } from "../hooks/useVideo.js";
import { useWatchHistory } from "../hooks/useWatchHistory.js";

export default function Watch() {
  const videoId = new URLSearchParams(window.location.search).get("id") || "video-1";
  const { video, loading, error } = useVideo(videoId);
  const { videos } = useVideos();
  const { addToHistory } = useWatchHistory();
  const [theater, setTheater] = useState(false);
  const commentsRef = useRef(null);

  useEffect(() => {
    if (video) addToHistory(video);
  }, [video, addToHistory]);

  function scrollToComments() {
    commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading) return <LoadingSpinner label="Loading video" />;

  if (error || !video) {
    return (
      <section className="empty-state">
        <h1>Video not found</h1>
        <p>{error || "This video is unavailable."}</p>
      </section>
    );
  }

  return (
    <div className={theater ? "watch-layout theater-mode" : "watch-layout"}>
      <div className="watch-primary">
        <div className="watch-player-wrap">
          <VideoPlayer video={video} theater={theater} onToggleTheater={() => setTheater((value) => !value)} />
          <VideoTikTokActions video={video} onScrollToComments={scrollToComments} />
        </div>
        <VideoInfo video={video} theater={theater} onToggleTheater={() => setTheater((value) => !value)} />
        <WatchCompanion video={video} />
        <div ref={commentsRef}>
          <CommentSection videoId={video.id} />
        </div>
      </div>
      <RecommendedVideos videos={videos} currentVideoId={video.id} />
    </div>
  );
}
