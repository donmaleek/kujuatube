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
import { usePlayer } from "../context/PlayerContext.js";

export default function Watch() {
  const videoId = new URLSearchParams(window.location.search).get("id") || "video-1";
  const { video, loading, error } = useVideo(videoId);
  const { videos } = useVideos();
  const { addToHistory } = useWatchHistory();
  const [theater, setTheater] = useState(false);
  const commentsRef = useRef(null);
  const playerWrapRef = useRef(null);
  const { openMiniPlayer, hideMiniPlayer, isMiniPlayerOpen, miniVideo, playbackState } = usePlayer();

  useEffect(() => {
    if (video) addToHistory(video);
  }, [video, addToHistory]);

  // Scroll-based mini player: when the player wrap leaves the viewport while playing,
  // push to mini player. When it re-enters and mini player is showing this video, hide it.
  useEffect(() => {
    const wrap = playerWrapRef.current;
    if (!wrap || !video) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          // Player completely off-screen — open mini player only if actively playing
          if (playbackState.playing && playbackState.currentTime > 0) {
            openMiniPlayer(video, { ...playbackState, playing: true });
          }
        } else {
          // Player back in view — dismiss mini player for this video
          if (isMiniPlayerOpen && miniVideo?.id === video.id) {
            hideMiniPlayer({ currentTime: playbackState.currentTime });
          }
        }
      },
      { threshold: 0 } // fire only when fully off-screen (was 0.2 — fired too eagerly)
    );

    observer.observe(wrap);
    return () => observer.disconnect();
  // Re-create observer when video changes; playback state intentionally read at trigger time via closure
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id]);

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
        <div className="watch-player-wrap" ref={playerWrapRef}>
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
