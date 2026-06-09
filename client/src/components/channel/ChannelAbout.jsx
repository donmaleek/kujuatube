import { formatDate } from "../../utils/formatDate.js";
import { formatViews } from "../../utils/formatViews.js";

export default function ChannelAbout({ channel }) {
  if (!channel) return null;

  return (
    <section className="about-panel">
      <h2>About</h2>
      <p>{channel.about || "This channel has not added an about section yet."}</p>
      <dl className="stats-list">
        <div>
          <dt>Joined</dt>
          <dd>{formatDate(channel.createdAt)}</dd>
        </div>
        <div>
          <dt>Total views</dt>
          <dd>{formatViews(channel.totalViews || 0)}</dd>
        </div>
        <div>
          <dt>Country</dt>
          <dd>{channel.country || "Global"}</dd>
        </div>
      </dl>
    </section>
  );
}
