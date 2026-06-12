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

const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const qualityOptions = ["Auto", "1080p", "720p", "360p"];
const aspectOptions = [
  { value: "auto", label: "Auto", ratio: null },
  { value: "wide", label: "Wide 16:9", ratio: "16 / 9" },
  { value: "vertical", label: "Vertical 9:16", ratio: "9 / 16" },
  { value: "square", label: "Square 1:1", ratio: "1 / 1" },
  { value: "classic", label: "Classic 4:3", ratio: "4 / 3" }
];
const fitOptions = [
  { value: "contain", label: "Fit full video" },
  { value: "cover", label: "Fill frame" }
];

function getStoredPlayerPreference(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function storePlayerPreference(key, value) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore unavailable storage so playback controls keep working.
  }
}

function getAspectShape({ width, height }) {
  if (!width || !height) return "wide";
  const ratio = width / height;
  if (ratio < 0.8) return "vertical";
  if (ratio < 1.15) return "square";
  return "wide";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildCaptionSegments(video) {
  const source = [video?.description, video?.title].filter(Boolean).join(". ");
  return source
    .split(/[\n.!?]+/)
    .map((segment) => segment.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export default function VideoPlayer({ video, theater = false, onToggleTheater, autoStart = true, overlay }) {
  const shellRef = useRef(null);
  const videoRef = useRef(null);
  const settingsRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const { activeVideo, isMiniPlayerOpen, miniVideo, openMiniPlayer, playbackState, syncPlayback } = usePlayer();
  const previousVolumeRef = useRef(playbackState.volume || 0.82);
  const currentTimeRef = useRef(0); // always-current time without re-renders
  const isContextVideo = activeVideo?.id === video?.id;
  // isMiniVideo: the mini player is currently playing THIS video
  const isMiniVideo = miniVideo?.id === video?.id;
  const [playing, setPlaying] = useState(isContextVideo ? playbackState.playing : false);
  const [currentTime, setCurrentTime] = useState(isContextVideo ? playbackState.currentTime : 0);
  const [volume, setVolume] = useState(playbackState.volume || 0.82);
  const [muted, setMuted] = useState(Boolean(playbackState.muted));
  const [autoMuted, setAutoMuted] = useState(false); // true when browser forced muted autoplay
  const [captions, setCaptions] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [speed, setSpeed] = useState(playbackState.speed || 1);
  const [quality, setQuality] = useState("Auto");
  const [aspectMode, setAspectMode] = useState(() => getStoredPlayerPreference("kujuatime-aspect-mode", "auto"));
  const [fitMode, setFitMode] = useState(() => getStoredPlayerPreference("kujuatime-fit-mode", "contain"));
  const [naturalAspect, setNaturalAspect] = useState({ width: 16, height: 9 });
  const [mediaDuration, setMediaDuration] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [ambient, setAmbient] = useState(true);
  const [loop, setLoop] = useState(playbackState.loop ?? true);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [pictureInPictureActive, setPictureInPictureActive] = useState(false);
  const hasMedia = Boolean(video?.videoUrl);
  const canUsePictureInPicture = hasMedia && typeof document !== "undefined" && Boolean(document.pictureInPictureEnabled);
  const selectedAspect = aspectOptions.find((option) => option.value === aspectMode) || aspectOptions[0];
  const playerAspectRatio = selectedAspect.ratio || `${naturalAspect.width} / ${naturalAspect.height}`;
  const aspectShape = aspectMode === "auto" ? getAspectShape(naturalAspect) : aspectMode;
  const duration = useMemo(() => {
    return mediaDuration || parseDuration(video?.duration);
  }, [mediaDuration, video?.duration]);
  const progress = duration ? clamp((currentTime / duration) * 100, 0, 100) : 0;
  const captionSegments = useMemo(() => buildCaptionSegments(video), [video?.description, video?.title]);
  const captionText = useMemo(() => {
    if (!captionSegments.length) return "Captions are on.";
    const segmentIndex = clamp(Math.floor((currentTime / Math.max(duration, 1)) * captionSegments.length), 0, captionSegments.length - 1);
    return captionSegments[segmentIndex].slice(0, 180);
  }, [captionSegments, currentTime, duration]);

  useEffect(() => {
    if (!video) return;
    setNaturalAspect({ width: 16, height: 9 });
    setMediaDuration(0);
    setSettingsOpen(false);
    if (isContextVideo) {
      setCurrentTime(playbackState.currentTime || 0);
      // Don't resume playing in the main player if mini player is showing this video
      setPlaying(playbackState.playing && !isMiniVideo);
      setVolume(playbackState.volume || 0.82);
      setMuted(Boolean(playbackState.muted));
      setSpeed(playbackState.speed || 1);
      setLoop(playbackState.loop ?? true);
    } else {
      setCurrentTime(0);
      setPlaying(autoStart);
    }
  }, [video?.id]);

  useEffect(() => {
    if (volume > 0) previousVolumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    storePlayerPreference("kujuatime-aspect-mode", aspectMode);
  }, [aspectMode]);

  useEffect(() => {
    storePlayerPreference("kujuatime-fit-mode", fitMode);
  }, [fitMode]);

  useEffect(() => {
    const videoNode = videoRef.current;
    if (!videoNode) return undefined;

    videoNode.volume = volume;
    videoNode.muted = muted;
    videoNode.playbackRate = speed;
    videoNode.loop = loop;
  }, [loop, volume, muted, speed]);

  useEffect(() => {
    const videoNode = videoRef.current;
    const tracks = videoNode?.textTracks;
    if (!tracks) return;

    for (let index = 0; index < tracks.length; index += 1) {
      tracks[index].mode = captions ? "showing" : "disabled";
    }
  }, [captions, video?.id]);

  useEffect(() => {
    if (!settingsOpen) return undefined;

    function onPointerDown(event) {
      if (settingsRef.current?.contains(event.target) || settingsButtonRef.current?.contains(event.target)) return;
      setSettingsOpen(false);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") setSettingsOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [settingsOpen]);

  useEffect(() => {
    function onFullscreenChange() {
      setFullscreenActive(document.fullscreenElement === shellRef.current);
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const videoNode = videoRef.current;
    if (!videoNode) return undefined;

    function onEnterPictureInPicture() {
      setPictureInPictureActive(true);
    }

    function onLeavePictureInPicture() {
      setPictureInPictureActive(false);
    }

    videoNode.addEventListener("enterpictureinpicture", onEnterPictureInPicture);
    videoNode.addEventListener("leavepictureinpicture", onLeavePictureInPicture);

    return () => {
      videoNode.removeEventListener("enterpictureinpicture", onEnterPictureInPicture);
      videoNode.removeEventListener("leavepictureinpicture", onLeavePictureInPicture);
    };
  }, [video?.id]);

  // Sync player state to context — excludes currentTime to prevent 4× per-second churn.
  // currentTime is synced on pause (effect below) and on seek.
  useEffect(() => {
    if (!video) return;
    syncPlayback(video, { duration, loop, muted, playing, speed, volume });
  }, [duration, loop, muted, playing, speed, syncPlayback, video, volume]);

  // Sync currentTime to context when paused so mini-player and IntersectionObserver
  // resume from the right position.
  useEffect(() => {
    if (!video || playing) return;
    syncPlayback(video, { currentTime: currentTimeRef.current });
  }, [playing, syncPlayback, video]);

  useEffect(() => {
    if (hasMedia || !playing) return undefined;

    const interval = setInterval(() => {
      setCurrentTime((time) => {
        const next = time + speed;
        if (next >= duration) {
          const shouldContinue = loop || autoplay;
          setPlaying(shouldContinue);
          return shouldContinue ? 0 : duration;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoplay, duration, hasMedia, loop, playing, speed]);

  async function startMediaPlayback({ allowMutedFallback = false } = {}) {
    const videoNode = videoRef.current;
    if (!videoNode) return false;

    setPlaying(true);

    try {
      await videoNode.play();
      setPlaying(true);
      return true;
    } catch (error) {
      const canRetryMuted = allowMutedFallback && error?.name === "NotAllowedError" && !videoNode.muted;

      if (canRetryMuted) {
        videoNode.muted = true;
        setMuted(true);
        setAutoMuted(true); // flag so we show the unmute hint

        try {
          await videoNode.play();
          setPlaying(true);
          return true;
        } catch {
          // Fall through to the paused state when the browser still refuses playback.
        }
      }

      setPlaying(false);
      return false;
    }
  }

  function unmutePlayer() {
    if (!videoRef.current) return;
    videoRef.current.muted = false;
    setMuted(false);
    setAutoMuted(false);
  }

  // Pause main player when mini player takes over this video
  useEffect(() => {
    if (isMiniPlayerOpen && isMiniVideo && hasMedia) {
      videoRef.current?.pause();
      setPlaying(false);
    }
  }, [isMiniPlayerOpen, isMiniVideo, hasMedia]);

  useEffect(() => {
    // Don't start the main player if the mini player is already playing this video
    if (!video || !autoStart || (isMiniPlayerOpen && isMiniVideo)) return undefined;

    let cancelled = false;

    async function beginSelectedVideo() {
      if (!hasMedia) {
        setPlaying(true);
        return;
      }

      const videoNode = videoRef.current;
      if (!videoNode) return;

      const resumeTime = isContextVideo ? playbackState.currentTime || 0 : 0;
      if (Number.isFinite(resumeTime) && resumeTime > 0) videoNode.currentTime = resumeTime;

      const started = await startMediaPlayback({ allowMutedFallback: true });
      if (cancelled || started) return;
      setPlaying(false);
    }

    beginSelectedVideo();

    return () => {
      cancelled = true;
    };
  }, [autoStart, hasMedia, isMiniVideo, isMiniPlayerOpen, video?.id]);

  async function togglePlay() {
    if (!hasMedia) {
      setPlaying((value) => !value);
      return;
    }

    const videoNode = videoRef.current;
    if (!videoNode) return;

    if (videoNode.paused) {
      // User clicked play — never silently mute on explicit interaction
      // If the browser had forced muted autoplay, unmute now
      if (autoMuted) unmutePlayer();
      await startMediaPlayback({ allowMutedFallback: false });
    } else {
      videoNode.pause();
      setPlaying(false);
    }
  }

  function seekTo(percent) {
    if (!duration) return;
    const nextTime = (clamp(Number(percent), 0, 100) / 100) * duration;
    setCurrentTime(nextTime);
    currentTimeRef.current = nextTime;
    if (videoRef.current) videoRef.current.currentTime = nextTime;
  }

  function skip(amount) {
    const nextTime = Math.min(duration, Math.max(0, currentTime + amount));
    setCurrentTime(nextTime);
    currentTimeRef.current = nextTime;
    if (videoRef.current) videoRef.current.currentTime = nextTime;
  }

  function updateVolume(nextValue) {
    const nextVolume = clamp(Number(nextValue), 0, 1);
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
  }

  function toggleMute() {
    if (muted || volume === 0) {
      setVolume((value) => (value > 0 ? value : previousVolumeRef.current || 0.82));
      setMuted(false);
      return;
    }

    previousVolumeRef.current = volume;
    setMuted(true);
  }

  function toggleCaptions() {
    setCaptions((value) => !value);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await shellRef.current?.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch {
      try {
        videoRef.current?.webkitEnterFullscreen?.();
      } catch {
        // Fullscreen is browser-controlled; leave the player unchanged if blocked.
      }
    }
  }

  async function togglePictureInPicture() {
    if (!videoRef.current || !document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      setPictureInPictureActive(false);
    }
  }

  function sendToMiniPlayer() {
    openMiniPlayer(video, {
      currentTime: currentTimeRef.current,
      duration,
      loop: true,
      muted,
      playing: true,
      speed,
      volume
    });
  }

  function updateMediaMetadata(event) {
    const { currentTime: nextTime, duration: nextDuration, videoHeight, videoWidth } = event.currentTarget;
    if (videoWidth && videoHeight) setNaturalAspect({ width: videoWidth, height: videoHeight });
    if (Number.isFinite(nextDuration) && nextDuration > 0) setMediaDuration(nextDuration);
    setCurrentTime(nextTime);
    currentTimeRef.current = nextTime;
  }

  function updateMediaTime(event) {
    const { currentTime: nextTime, duration: nextDuration } = event.currentTarget;
    if (Number.isFinite(nextDuration) && nextDuration > 0) setMediaDuration(nextDuration);
    setCurrentTime(nextTime);
    currentTimeRef.current = nextTime;
  }

  function handleMediaEnded() {
    if (!loop && !autoplay) setPlaying(false);
  }

  function onPlayerKeyDown(event) {
    if (event.target.tagName === "INPUT" || event.target.tagName === "SELECT") return;

    if (event.key === " " || event.key.toLowerCase() === "k") {
      event.preventDefault();
      togglePlay();
    }
    if (event.key.toLowerCase() === "j") skip(-10);
    if (event.key.toLowerCase() === "l") skip(10);
    if (event.key.toLowerCase() === "m") toggleMute();
    if (event.key.toLowerCase() === "c") toggleCaptions();
    if (event.key.toLowerCase() === "f") toggleFullscreen();
    if (event.key.toLowerCase() === "t") onToggleTheater?.();
  }

  if (!video) return <div className="player-shell skeleton" />;

  return (
    <section
      className={[
        "player-shell",
        "custom-player",
        `aspect-${aspectShape}`,
        ambient ? "ambient-on" : "",
        playing ? "is-playing" : "is-paused"
      ].filter(Boolean).join(" ")}
      onKeyDown={onPlayerKeyDown}
      ref={shellRef}
      style={{ "--player-aspect-ratio": playerAspectRatio, "--player-object-fit": fitMode }}
      tabIndex="0"
    >
      <div className="player-ambient" style={{ backgroundImage: `url(${video.thumbnailUrl || "/logo.svg"})` }} />
      {video.videoUrl ? (
        <video
          className="video-player"
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          muted={muted}
          playsInline
          preload="auto"
          loop={loop}
          ref={videoRef}
          onClick={togglePlay}
          onDurationChange={updateMediaMetadata}
          onEnded={handleMediaEnded}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onTimeUpdate={updateMediaTime}
          onLoadedMetadata={updateMediaMetadata}
        />
      ) : (
        <button className="video-placeholder" style={{ backgroundImage: `url(${video.thumbnailUrl || "/logo.svg"})` }} onClick={togglePlay} type="button">
          <span className="player-preview-label">{quality} preview</span>
        </button>
      )}
      <button className={playing ? "player-center-button playing" : "player-center-button"} onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} type="button">
        <YoutubeIcon name={playing ? "pause" : "play"} size={42} />
      </button>
      {autoMuted && playing ? (
        <button className="player-unmute-hint" onClick={unmutePlayer} type="button" aria-label="Unmute">
          <YoutubeIcon name="muted" size={20} />
          <span>Tap to unmute</span>
        </button>
      ) : null}
      {captions ? (
        <div className="caption-overlay">
          {captionText}
        </div>
      ) : null}
      <div className="player-controls">
        <div className="player-timeline-wrap">
          <input
            aria-label="Seek"
            className="player-timeline"
            max="100"
            min="0"
            onChange={(event) => seekTo(event.target.value)}
            style={{ "--progress": `${progress}%` }}
            type="range"
            value={progress || 0}
          />
        </div>
        <div className="player-control-row">
          <div className="player-left-controls">
            <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} type="button">
              <YoutubeIcon name={playing ? "pause" : "play"} />
            </button>
            <button className="mobile-secondary-control" onClick={() => skip(-10)} aria-label="Back 10 seconds" type="button">
              <YoutubeIcon name="rewind" />
            </button>
            <button className="mobile-secondary-control" onClick={() => skip(10)} aria-label="Forward 10 seconds" type="button">
              <YoutubeIcon name="forward" />
            </button>
            <button className={muted || volume === 0 ? "active" : ""} onClick={toggleMute} aria-label={muted || volume === 0 ? "Unmute" : "Mute"} aria-pressed={muted || volume === 0} type="button">
              <YoutubeIcon name={muted || volume === 0 ? "muted" : "volume"} />
            </button>
            <input
              aria-label="Volume"
              className="volume-slider"
              max="1"
              min="0"
              onChange={(event) => updateVolume(event.target.value)}
              step="0.01"
              style={{ "--volume": `${(muted ? 0 : volume) * 100}%` }}
              type="range"
              value={muted ? 0 : volume}
            />
            <span className="player-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="player-right-controls">
            <button className={captions ? "active" : ""} onClick={toggleCaptions} aria-label={captions ? "Turn captions off" : "Turn captions on"} aria-pressed={captions} type="button">
              <YoutubeIcon name="captions" />
            </button>
            <button className={settingsOpen ? "active" : ""} onClick={() => setSettingsOpen((value) => !value)} aria-label="Settings" aria-expanded={settingsOpen} aria-controls="player-settings-panel" ref={settingsButtonRef} type="button">
              <YoutubeIcon name="gear" />
            </button>
            <button className={theater ? "mobile-secondary-control active" : "mobile-secondary-control"} onClick={onToggleTheater} aria-label="Theater mode" aria-pressed={theater} type="button">
              <YoutubeIcon name="theater" />
            </button>
            <button className="mobile-secondary-control" onClick={sendToMiniPlayer} aria-label="Drop to mini player" type="button">
              <YoutubeIcon name="pip" />
            </button>
            <button className={pictureInPictureActive ? "mobile-secondary-control active" : "mobile-secondary-control"} onClick={togglePictureInPicture} aria-label="Picture in picture" aria-pressed={pictureInPictureActive} disabled={!canUsePictureInPicture} type="button">
              <YoutubeIcon name="pip" />
            </button>
            <button className={fullscreenActive ? "active" : ""} onClick={toggleFullscreen} aria-label={fullscreenActive ? "Exit fullscreen" : "Fullscreen"} aria-pressed={fullscreenActive} type="button">
              <YoutubeIcon name="fullscreen" />
            </button>
          </div>
        </div>
      </div>
      {overlay ? <div className="player-side-overlay">{overlay}</div> : null}
      {settingsOpen ? (
        <div className="player-settings-panel" id="player-settings-panel" ref={settingsRef}>
          <label>
            Playback speed
            <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
              {speedOptions.map((option) => (
                <option value={option} key={option}>
                  {option === 1 ? "Normal" : `${option}x`}
                </option>
              ))}
            </select>
          </label>
          <label>
            Quality
            <select value={quality} onChange={(event) => setQuality(event.target.value)}>
              {qualityOptions.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Aspect ratio
            <select value={aspectMode} onChange={(event) => setAspectMode(event.target.value)}>
              {aspectOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Frame fit
            <select value={fitMode} onChange={(event) => setFitMode(event.target.value)}>
              {fitOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="settings-toggle">
            <input type="checkbox" checked={autoplay} onChange={(event) => setAutoplay(event.target.checked)} />
            Autoplay
          </label>
          <label className="settings-toggle">
            <input type="checkbox" checked={loop} onChange={(event) => setLoop(event.target.checked)} />
            Loop continuously
          </label>
          <label className="settings-toggle">
            <input type="checkbox" checked={ambient} onChange={(event) => setAmbient(event.target.checked)} />
            Ambient glow
          </label>
          <p>{theater ? "Theater mode active" : "Default view"}</p>
        </div>
      ) : null}
    </section>
  );
}
