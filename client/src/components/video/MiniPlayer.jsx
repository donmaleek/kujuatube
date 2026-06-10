import { useEffect, useMemo, useRef, useState } from "react";
import YoutubeIcon from "../common/YoutubeIcon.jsx";
import { usePlayer } from "../../context/PlayerContext.js";

function formatTime(value = 0) {
  const total = Math.max(0, Math.floor(value));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function parseDuration(value = "8:42") {
  const parts = String(value).split(":").map(Number);
  if (parts.some(Number.isNaN)) return 522;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 522;
}

export default function MiniPlayer() {
  const videoRef = useRef(null);
  const {
    closeMiniPlayer,
    hideMiniPlayer,
    isMiniPlayerOpen,
    miniPlaybackState,
    miniVideo,
    syncMiniPlayback
  } = usePlayer();

  const [currentTime, setCurrentTime] = useState(miniPlaybackState.currentTime || 0);
  const duration = useMemo(
    () => miniPlaybackState.duration || parseDuration(miniVideo?.duration),
    [miniVideo?.duration, miniPlaybackState.duration]
  );
  const hasMedia = Boolean(miniVideo?.videoUrl);
  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  // Sync current time when mini player opens for a new video
  useEffect(() => {
    if (!miniVideo) return;
    setCurrentTime(Math.min(miniPlaybackState.currentTime || 0, duration));
  }, [miniVideo?.id]);

  // Simulated progress tick for placeholder videos (no actual media)
  useEffect(() => {
    if (!isMiniPlayerOpen || !miniVideo || hasMedia || !miniPlaybackState.playing) return undefined;

    const interval = setInterval(() => {
      setCurrentTime((time) => {
        const nextTime = time + (miniPlaybackState.speed || 1);
        const shouldLoop = miniPlaybackState.loop ?? true;
        const resolvedTime = nextTime >= duration ? (shouldLoop ? 0 : duration) : nextTime;
        syncMiniPlayback(miniVideo, {
          currentTime: resolvedTime,
          duration,
          playing: shouldLoop || nextTime < duration
        });
        return resolvedTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [miniVideo, duration, hasMedia, isMiniPlayerOpen, miniPlaybackState.loop, miniPlaybackState.playing, miniPlaybackState.speed, syncMiniPlayback]);

  // Drive the real <video> element
  useEffect(() => {
    const videoNode = videoRef.current;
    if (!videoNode || !miniVideo || !hasMedia) return;

    videoNode.volume = miniPlaybackState.volume ?? 0.82;
    videoNode.muted = Boolean(miniPlaybackState.muted);
    videoNode.playbackRate = miniPlaybackState.speed || 1;
    videoNode.loop = miniPlaybackState.loop ?? true;

    if (Number.isFinite(currentTime) && Math.abs(videoNode.currentTime - currentTime) > 1.5) {
      videoNode.currentTime = currentTime;
    }

    if (miniPlaybackState.playing) {
      videoNode.play().catch(() => syncMiniPlayback(miniVideo, { playing: false }));
    } else {
      videoNode.pause();
    }
  }, [miniVideo, currentTime, hasMedia, miniPlaybackState.loop, miniPlaybackState.muted, miniPlaybackState.playing, miniPlaybackState.speed, miniPlaybackState.volume, syncMiniPlayback]);

  if (!isMiniPlayerOpen || !miniVideo) return null;

  function togglePlay() {
    syncMiniPlayback(miniVideo, { playing: !miniPlaybackState.playing, currentTime, duration });
  }

  function seekTo(percent) {
    const nextTime = (Number(percent) / 100) * duration;
    setCurrentTime(nextTime);
    if (videoRef.current) videoRef.current.currentTime = nextTime;
    syncMiniPlayback(miniVideo, { currentTime: nextTime, duration });
  }

  function handleExpand() {
    // Carry current time so main player resumes from the right spot
    hideMiniPlayer({ currentTime, duration, playing: miniPlaybackState.playing });
  }

  return (
    <aside className="mini-player" aria-label="KujuaTime mini player">
      <div className="mini-player-media" onClick={togglePlay} role="button" tabIndex="0" onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") togglePlay(); }} aria-label={miniPlaybackState.playing ? "Pause" : "Play"}>
        {hasMedia ? (
          <video
            className="mini-player-video"
            onLoadedMetadata={(event) => syncMiniPlayback(miniVideo, { duration: event.currentTarget.duration })}
            onTimeUpdate={(event) => {
              const nextTime = event.currentTarget.currentTime;
              setCurrentTime(nextTime);
              syncMiniPlayback(miniVideo, { currentTime: nextTime, duration: event.currentTarget.duration || duration });
            }}
            playsInline
            poster={miniVideo.thumbnailUrl}
            ref={videoRef}
            src={miniVideo.videoUrl}
          />
        ) : (
          <div
            className="mini-player-poster"
            style={{ backgroundImage: `url(${miniVideo.thumbnailUrl || "/logo.svg"})` }}
          />
        )}
        {/* Play/pause overlay */}
        <div className={`mini-player-play-overlay ${miniPlaybackState.playing ? "is-playing" : ""}`}>
          <YoutubeIcon name={miniPlaybackState.playing ? "pause" : "play"} size={30} />
        </div>
      </div>

      <div className="mini-player-body">
        <div className="mini-player-meta">
          <strong title={miniVideo.title}>{miniVideo.title}</strong>
          <span>{miniVideo.channelName || miniVideo.ownerName || "KujuaTime Creator"}</span>
        </div>
        <input
          aria-label="Mini player seek"
          className="mini-player-progress"
          max="100"
          min="0"
          onChange={(event) => seekTo(event.target.value)}
          style={{ "--progress": `${progress}%` }}
          type="range"
          value={progress || 0}
        />
        <div className="mini-player-footer">
          <span className="mini-player-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <div className="mini-player-actions">
            <button onClick={togglePlay} type="button" aria-label={miniPlaybackState.playing ? "Pause" : "Play"}>
              <YoutubeIcon name={miniPlaybackState.playing ? "pause" : "play"} size={18} />
            </button>
            {/* Expand: go to full watch page; hides mini player and resumes main player */}
            <a
              href={`/watch?id=${miniVideo.id}`}
              onClick={(e) => { e.preventDefault(); handleExpand(); window.history.pushState({}, "", `/watch?id=${miniVideo.id}`); window.dispatchEvent(new PopStateEvent("popstate")); }}
              aria-label="Expand to full player"
              title="Expand"
            >
              <YoutubeIcon name="theater" size={18} />
            </a>
            <button onClick={closeMiniPlayer} type="button" aria-label="Close mini player">
              <YoutubeIcon name="close" size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
