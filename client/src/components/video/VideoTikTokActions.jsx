import { useEffect, useState } from "react";
import YoutubeIcon from "../common/YoutubeIcon.jsx";
import { fetchMyLike, likeVideo, dislikeVideo, removeLike } from "../../services/likeService.js";
import { subscribe, unsubscribe, listSubscriptions } from "../../services/subscriptionService.js";
import { getAuthToken } from "../../services/api.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function VideoTikTokActions({ video, onScrollToComments }) {
  const { user } = useAuth();
  const [userLike, setUserLike] = useState(null); // null | 1 | -1
  const [likeCount, setLikeCount] = useState(video?.likes || 0);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(false);

  const channelId = video?.channelId || video?.userId;

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

  async function handleDislike() {
    if (!user) { redirectToLogin(); return; }
    if (userLike === -1) {
      await removeLike(video.id).catch(() => {});
      setUserLike(null);
    } else {
      await dislikeVideo(video.id).catch(() => {});
      if (userLike === 1) setLikeCount((c) => Math.max(0, c - 1));
      setUserLike(-1);
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

  return (
    <div className="video-tiktok-actions">
      <div className="tiktok-avatar-wrap">
        <a
          className="tiktok-avatar"
          href={`/channel?id=${channelId}`}
          title={video?.channelName || "Channel"}
        >
          {(video?.channelName || video?.ownerName || "K")[0].toUpperCase()}
        </a>
        <button
          className={subscribed ? "tiktok-subscribe-dot subscribed" : "tiktok-subscribe-dot"}
          onClick={toggleSubscribe}
          disabled={subscribing}
          aria-label={subscribed ? "Unsubscribe" : "Subscribe"}
          title={subscribed ? "Subscribed" : "Subscribe"}
          type="button"
        >
          {subscribed ? "✓" : "+"}
        </button>
      </div>

      <button
        className={userLike === 1 ? "tiktok-action active" : "tiktok-action"}
        onClick={handleLike}
        type="button"
        aria-label="Like"
        aria-pressed={userLike === 1}
      >
        <span className="tiktok-icon-wrap"><YoutubeIcon name="like" size={26} /></span>
        <span>{likeCount > 0 ? likeCount.toLocaleString() : "Like"}</span>
      </button>

      <button
        className={userLike === -1 ? "tiktok-action active" : "tiktok-action"}
        onClick={handleDislike}
        type="button"
        aria-label="Dislike"
        aria-pressed={userLike === -1}
      >
        <span className="tiktok-icon-wrap"><YoutubeIcon name="dislike" size={26} /></span>
        <span>Dislike</span>
      </button>

      <button className="tiktok-action" onClick={onScrollToComments} type="button" aria-label="Jump to comments">
        <span className="tiktok-icon-wrap"><YoutubeIcon name="comment" size={26} /></span>
        <span>Comment</span>
      </button>

      <button
        className={shared ? "tiktok-action active" : "tiktok-action"}
        onClick={share}
        type="button"
        aria-label="Share"
      >
        <span className="tiktok-icon-wrap"><YoutubeIcon name="share" size={26} /></span>
        <span>{shared ? "Copied!" : "Share"}</span>
      </button>

      <button
        className={saved ? "tiktok-action active" : "tiktok-action"}
        onClick={() => setSaved((v) => !v)}
        type="button"
        aria-label="Save"
      >
        <span className="tiktok-icon-wrap"><YoutubeIcon name="bookmark" size={26} /></span>
        <span>{saved ? "Saved" : "Save"}</span>
      </button>
    </div>
  );
}
