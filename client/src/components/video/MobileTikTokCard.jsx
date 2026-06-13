import { forwardRef, useEffect, useRef, useState } from "react";
import YoutubeIcon from "../common/YoutubeIcon.jsx";
import { fetchMyLike, likeVideo, removeLike } from "../../services/likeService.js";
import { subscribe, unsubscribe, listSubscriptions } from "../../services/subscriptionService.js";
import { getAuthToken } from "../../services/api.js";
import { useAuth } from "../../hooks/useAuth.js";

function fmtCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const MobileTikTokCard = forwardRef(function MobileTikTokCard(
  { video, active, preloadNext = false },
  ref
) {
  const videoRef = useRef(null);
  const tapTimerRef = useRef(null);
  const { user } = useAuth();

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [userLike, setUserLike] = useState(null);
  const [likeCount, setLikeCount] = useState(video?.likes || 0);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tapIcon, setTapIcon] = useState(null); // "play" | "pause" | null

  const channelId = video?.channelId || video?.userId;
  const channelName = video?.channelName || video?.ownerName || "Creator";
  const channelAvatar = video?.channelAvatarUrl || "";
  const commentCount = video?.commentCount || 0;

  // Load like + subscription state when logged in
  useEffect(() => {
    if (!user || !video?.id || !getAuthToken()) return;

    fetchMyLike(video.id)
      .then((data) => {
        const mine = (data.likes || [])[0];
        if (mine) setUserLike(mine.value === 1 ? 1 : -1);
      })
      .catch(() => {});

    if (channelId) {
      listSubscriptions()
        .then((data) => {
          const subs = data.subscriptions || data || [];
          setSubscribed(subs.some((s) => s.channelId === channelId));
        })
        .catch(() => {});
    }
  }, [user, video?.id, channelId]);

  // Auto-play / pause based on active prop
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (active) {
      vid.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      vid.pause();
      vid.currentTime = 0;
      setPlaying(false);
      setProgress(0);
    }
  }, [active]);

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(tapTimerRef.current), []);

  function redirectToLogin() {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  }

  async function togglePlay(e) {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused) {
      await vid.play().catch(() => {});
      setPlaying(true);
      flashTap("play");
    } else {
      vid.pause();
      setPlaying(false);
      flashTap("pause");
    }
  }

  function flashTap(icon) {
    setTapIcon(icon);
    clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => setTapIcon(null), 700);
  }

  async function toggleSubscribe(e) {
    e.stopPropagation();
    if (!user) { redirectToLogin(); return; }
    setSubscribing(true);
    try {
      if (subscribed) {
        await unsubscribe(channelId);
        setSubscribed(false);
      } else {
        await subscribe(channelId);
        setSubscribed(true);
      }
    } catch {}
    setSubscribing(false);
  }

  async function handleLike(e) {
    e.stopPropagation();
    if (!user) { redirectToLogin(); return; }
    if (userLike === 1) {
      await removeLike(video.id).catch(() => {});
      setUserLike(null);
      setLikeCount((c) => Math.max(0, c - 1));
    } else {
      await likeVideo(video.id).catch(() => {});
      if (userLike === null) setLikeCount((c) => c + 1);
      setUserLike(1);
    }
  }

  async function handleShare(e) {
    e.stopPropagation();
    const url = `${window.location.origin}/watch?id=${video.id}`;
    if (navigator.share) {
      await navigator.share({ title: video.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  function handleDownload(e) {
    e.stopPropagation();
    if (!video?.videoUrl) return;
    const a = document.createElement("a");
    a.href = video.videoUrl;
    a.download = `${video.title || "video"}.mp4`;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleTimeUpdate(e) {
    const { currentTime, duration } = e.currentTarget;
    if (duration) setProgress((currentTime / duration) * 100);
  }

  // Derive preload value: active = full preload, adjacent = metadata only, others = none
  const preload = active ? "auto" : preloadNext ? "metadata" : "none";

  return (
    <div className="tt-card" ref={ref}>
      {/* Full-screen video */}
      <video
        ref={videoRef}
        className="tt-card-video"
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        muted={muted}
        loop
        playsInline
        preload={preload}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
      />

      {/* Center tap feedback */}
      {tapIcon && (
        <div className="tt-tap-flash" key={tapIcon + Date.now()}>
          <YoutubeIcon name={tapIcon === "play" ? "play" : "pause"} size={56} />
        </div>
      )}

      {/* Muted hint — top-center */}
      {muted && active && (
        <button
          className="tt-unmute-hint"
          onClick={(e) => { e.stopPropagation(); setMuted(false); }}
          type="button"
        >
          <YoutubeIcon name="muted" size={16} />
          <span>Tap to unmute</span>
        </button>
      )}

      {/* ── Right-column actions ── */}
      <div className="tt-card-actions">
        {/* Creator avatar + follow dot */}
        <div className="tt-card-creator">
          <a
            className="tt-card-avatar"
            href={`/channel?id=${channelId}`}
            onClick={(e) => e.stopPropagation()}
            title={channelName}
          >
            {channelAvatar
              ? <img src={channelAvatar} alt={channelName} className="tt-card-avatar-img" loading="lazy" decoding="async" />
              : <span>{(channelName || "K")[0].toUpperCase()}</span>}
          </a>
          <button
            className={subscribed ? "tt-card-follow subscribed" : "tt-card-follow"}
            onClick={toggleSubscribe}
            disabled={subscribing}
            aria-label={subscribed ? "Unsubscribe" : "Follow"}
            type="button"
          >
            {subscribed ? "✓" : "+"}
          </button>
        </div>

        {/* Like */}
        <button
          className={userLike === 1 ? "tt-action-btn active" : "tt-action-btn"}
          onClick={handleLike}
          aria-label="Like"
          type="button"
        >
          <span className="tt-action-icon"><YoutubeIcon name="like" size={28} /></span>
          <span className="tt-action-label">{likeCount > 0 ? fmtCount(likeCount) : "Like"}</span>
        </button>

        {/* Comment — navigates to watch page where comments live */}
        <a
          className="tt-action-btn"
          href={`/watch?id=${video.id}`}
          onClick={(e) => e.stopPropagation()}
          aria-label="Comments"
        >
          <span className="tt-action-icon"><YoutubeIcon name="comment" size={28} /></span>
          <span className="tt-action-label">{commentCount > 0 ? fmtCount(commentCount) : "Comment"}</span>
        </a>

        {/* Save */}
        <button
          className={saved ? "tt-action-btn active" : "tt-action-btn"}
          onClick={(e) => { e.stopPropagation(); setSaved((v) => !v); }}
          aria-label={saved ? "Saved" : "Save"}
          type="button"
        >
          <span className="tt-action-icon"><YoutubeIcon name="bookmark" size={26} /></span>
          <span className="tt-action-label">{saved ? "Saved" : "Save"}</span>
        </button>

        {/* Share */}
        <button
          className={shared ? "tt-action-btn active" : "tt-action-btn"}
          onClick={handleShare}
          aria-label="Share"
          type="button"
        >
          <span className="tt-action-icon"><YoutubeIcon name="share" size={26} /></span>
          <span className="tt-action-label">{shared ? "Copied!" : "Share"}</span>
        </button>

        {/* Download */}
        <button
          className="tt-action-btn"
          onClick={handleDownload}
          aria-label="Download"
          type="button"
        >
          <span className="tt-action-icon"><YoutubeIcon name="download" size={26} /></span>
          <span className="tt-action-label">Download</span>
        </button>

        {/* Mute toggle */}
        <button
          className="tt-action-btn"
          onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
          aria-label={muted ? "Unmute" : "Mute"}
          type="button"
        >
          <span className="tt-action-icon">
            <YoutubeIcon name={muted ? "muted" : "volume"} size={24} />
          </span>
          <span className="tt-action-label">{muted ? "Unmute" : "Mute"}</span>
        </button>
      </div>

      {/* ── Bottom-left info strip ── */}
      <div className="tt-card-info">
        <a
          className="tt-card-username"
          href={`/channel?id=${channelId}`}
          onClick={(e) => e.stopPropagation()}
        >
          @{channelName}
        </a>
        <a
          className="tt-card-title"
          href={`/watch?id=${video.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          {video.title}
        </a>
        {video.description ? (
          <p className="tt-card-desc">{video.description}</p>
        ) : null}
        <div className="tt-card-music">
          <div className={active && playing ? "tt-music-disc spinning" : "tt-music-disc"} />
          <span className="tt-music-label">♪ Original Sound · {channelName}</span>
        </div>
      </div>

      {/* ── Thin progress bar ── */}
      <div className="tt-card-progress-wrap">
        <div className="tt-card-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
});

export default MobileTikTokCard;
