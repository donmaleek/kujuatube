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
    activeVideo,
    closeMiniPlayer,
    hideMiniPlayer,
    isMiniPlayerOpen,
    playbackState,
    syncPlayback
  } = usePlayer();
  const [currentTime, setCurrentTime] = useState(playbackState.currentTime || 0);
  const duration = useMemo(
    () => playbackState.duration || parseDuration(activeVideo?.duration),
    [activeVideo?.duration, playbackState.duration]
  );
  const hasMedia = Boolean(activeVideo?.videoUrl);
  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  useEffect(() => {
    if (!activeVideo) return;
    setCurrentTime(Math.min(playbackState.currentTime || 0, duration));
  }, [activeVideo?.id]);

  useEffect(() => {
    if (!isMiniPlayerOpen || !activeVideo || hasMedia || !playbackState.playing) return undefined;

    const interval = setInterval(() => {
      setCurrentTime((time) => {
        const nextTime = time + (playbackState.speed || 1);
        const shouldLoop = playbackState.loop ?? true;
        const resolvedTime = nextTime >= duration ? (shouldLoop ? 0 : duration) : nextTime;
        syncPlayback(activeVideo, {
          currentTime: resolvedTime,
          duration,
          playing: shouldLoop || nextTime < duration
        });
        return resolvedTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVideo, duration, hasMedia, isMiniPlayerOpen, playbackState.loop, playbackState.playing, playbackState.speed, syncPlayback]);

  useEffect(() => {
    const videoNode = videoRef.current;
    if (!videoNode || !activeVideo || !hasMedia) return;

    videoNode.volume = playbackState.volume;
    videoNode.muted = playbackState.muted;
    videoNode.playbackRate = playbackState.speed;
    videoNode.loop = playbackState.loop ?? true;
    if (Number.isFinite(currentTime) && Math.abs(videoNode.currentTime - currentTime) > 1.5) {
      videoNode.currentTime = currentTime;
    }

    if (playbackState.playing) {
      videoNode.play().catch(() => syncPlayback(activeVideo, { playing: false }));
    } else {
      videoNode.pause();
    }
  }, [activeVideo, currentTime, hasMedia, playbackState.loop, playbackState.muted, playbackState.playing, playbackState.speed, playbackState.volume, syncPlayback]);

  if (!isMiniPlayerOpen || !activeVideo) return null;

  function togglePlay() {
    syncPlayback(activeVideo, { playing: !playbackState.playing, currentTime, duration });
  }

  function toggleLoop() {
    syncPlayback(activeVideo, { loop: !(playbackState.loop ?? true), currentTime, duration });
  }

  function seekTo(percent) {
    const nextTime = (Number(percent) / 100) * duration;
    setCurrentTime(nextTime);
    if (videoRef.current) videoRef.current.currentTime = nextTime;
    syncPlayback(activeVideo, { currentTime: nextTime, duration });
  }

  return (
    <aside className="mini-player" aria-label="KujuaTime mini player">
      <div className="mini-player-media">
        {hasMedia ? (
          <video
            className="mini-player-video"
            onLoadedMetadata={(event) => syncPlayback(activeVideo, { duration: event.currentTarget.duration })}
            onTimeUpdate={(event) => {
              const nextTime = event.currentTarget.currentTime;
              setCurrentTime(nextTime);
              syncPlayback(activeVideo, { currentTime: nextTime, duration: event.currentTarget.duration });
            }}
            playsInline
            poster={activeVideo.thumbnailUrl}
            ref={videoRef}
            src={activeVideo.videoUrl}
          />
        ) : (
          <button
            className="mini-player-poster"
            onClick={togglePlay}
            style={{ backgroundImage: `url(${activeVideo.thumbnailUrl || "/logo.svg"})` }}
            type="button"
          >
            <YoutubeIcon name={playbackState.playing ? "pause" : "play"} size={32} />
          </button>
        )}
        <span className="mini-player-loop-badge">{playbackState.loop ? "Looping" : "Loop off"}</span>
      </div>

      <div className="mini-player-body">
        <div>
          <strong>{activeVideo.title}</strong>
          <span>{activeVideo.channelName || activeVideo.ownerName || "KujuaTime Creator"}</span>
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
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          <div className="mini-player-actions">
            <button onClick={togglePlay} type="button" aria-label={playbackState.playing ? "Pause mini player" : "Play mini player"}>
              <YoutubeIcon name={playbackState.playing ? "pause" : "play"} size={18} />
            </button>
            <button className={playbackState.loop ? "active" : ""} onClick={toggleLoop} type="button" aria-label="Loop video">
              <YoutubeIcon name="history" size={18} />
            </button>
            <a href={`/watch?id=${activeVideo.id}`} onClick={hideMiniPlayer} aria-label="Open full player">
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
