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

  // Refs so the IntersectionObserver always reads fresh state without stale closures
  const playbackStateRef = useRef(playbackState);
  const isMiniPlayerOpenRef = useRef(isMiniPlayerOpen);
  const miniVideoRef = useRef(miniVideo);
  useEffect(() => { playbackStateRef.current = playbackState; }, [playbackState]);
  useEffect(() => { isMiniPlayerOpenRef.current = isMiniPlayerOpen; }, [isMiniPlayerOpen]);
  useEffect(() => { miniVideoRef.current = miniVideo; }, [miniVideo]);

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
        const state = playbackStateRef.current;
        if (!entry.isIntersecting) {
          if (state.playing && state.currentTime > 0) {
            openMiniPlayer(video, { ...state, playing: true });
          }
        } else {
          if (isMiniPlayerOpenRef.current && miniVideoRef.current?.id === video.id) {
            hideMiniPlayer({ currentTime: state.currentTime });
          }
        }
      },
      { threshold: 0 }
    );

    observer.observe(wrap);
    return () => observer.disconnect();
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
          <VideoPlayer
            video={video}
            theater={theater}
            onToggleTheater={() => setTheater((value) => !value)}
            overlay={<VideoTikTokActions video={video} onScrollToComments={scrollToComments} />}
          />
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
