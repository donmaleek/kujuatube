import { useEffect, useState } from "react";
import YoutubeIcon from "../common/YoutubeIcon.jsx";
import { fetchMyLike, likeVideo, dislikeVideo, removeLike } from "../../services/likeService.js";
import { subscribe, unsubscribe, listSubscriptions } from "../../services/subscriptionService.js";
import { getAuthToken } from "../../services/api.js";
import { useAuth } from "../../hooks/useAuth.js";

function fmtCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function TikBtn({ icon, label, active, onClick, size = 26 }) {
  return (
    <button
      type="button"
      className={active ? "tt-btn active" : "tt-btn"}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
    >
      <span className="tt-icon">
        <YoutubeIcon name={icon} size={size} />
      </span>
      <span className="tt-label">{label}</span>
    </button>
  );
}

export default function VideoTikTokActions({ video, onScrollToComments }) {
  const { user } = useAuth();
  const [userLike, setUserLike] = useState(null);
  const [likeCount, setLikeCount] = useState(video?.likes || 0);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(false);

  const channelId = video?.channelId || video?.userId;
  const channelName = video?.channelName || video?.ownerName || "";
  const channelAvatar = video?.channelAvatarUrl || "";
  const commentCount = video?.commentCount || 0;

  useEffect(() => {
    if (!user || !video?.id) return;
    const token = getAuthToken();
    if (!token) return;

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

  function redirectToLogin() {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  }

  async function toggleSubscribe() {
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

  async function handleLike() {
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

  async function share() {
    const url = `${window.location.origin}/watch?id=${video.id}`;
    if (navigator.share) {
      await navigator.share({ title: video.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    }
  }

  function downloadVideo() {
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

  return (
    <div className="tt-overlay">
      {/* Creator avatar + follow dot */}
      <div className="tt-creator">
        <a className="tt-avatar" href={`/channel?id=${channelId}`} title={channelName}>
          {channelAvatar
            ? <img src={channelAvatar} alt={channelName} className="tt-avatar-img" decoding="async" />
            : (channelName || "K")[0].toUpperCase()}
        </a>
        <button
          className={subscribed ? "tt-follow subscribed" : "tt-follow"}
          onClick={toggleSubscribe}
          disabled={subscribing}
          aria-label={subscribed ? "Unsubscribe" : "Follow"}
          type="button"
        >
          {subscribed ? "✓" : "+"}
        </button>
      </div>

      {/* Actions */}
      <TikBtn
        icon="like"
        label={likeCount > 0 ? fmtCount(likeCount) : "Like"}
        active={userLike === 1}
        onClick={handleLike}
      />
      <TikBtn
        icon="comment"
        label={commentCount > 0 ? fmtCount(commentCount) : "Comments"}
        onClick={onScrollToComments}
      />
      <TikBtn
        icon="bookmark"
        label={saved ? "Saved" : "Save"}
        active={saved}
        onClick={() => setSaved((v) => !v)}
      />
      <TikBtn
        icon="download"
        label="Download"
        onClick={downloadVideo}
      />
      <TikBtn
        icon="share"
        label={shared ? "Copied!" : "Share"}
        active={shared}
        onClick={share}
      />
    </div>
  );
}
