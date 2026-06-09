import SubscribeButton from "./SubscribeButton.jsx";

export default function ChannelHeader({ channel }) {
  if (!channel) return null;

  return (
    <section className="channel-header">
      <div className="channel-banner" style={{ backgroundImage: `url(${channel.bannerUrl || "/logo.svg"})` }} />
      <div className="channel-summary">
        <span className="channel-avatar">{(channel.name || "K").slice(0, 1)}</span>
        <div>
          <h1>{channel.name}</h1>
          <p className="muted">
            @{channel.handle || channel.id} · {channel.subscribers || 0} subscribers · {channel.videoCount || 0} videos
          </p>
          <p>{channel.about || "Creating videos for the KujuaTime community."}</p>
        </div>
        <SubscribeButton channelId={channel.id} initialSubscribed={channel.isSubscribed} />
      </div>
    </section>
  );
}
