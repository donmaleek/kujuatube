import Avatar from "../components/common/Avatar.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { useSubscriptions } from "../hooks/useSubscriptions.js";

export default function Subscriptions() {
  const { subscriptions, loading, error } = useSubscriptions();

  return (
    <>
      <section className="page-heading">
        <h1>Subscriptions</h1>
        <p>Channels you follow appear here.</p>
      </section>
      {loading ? <LoadingSpinner label="Loading subscriptions" /> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <section className="list-panel">
        {subscriptions.map((item) => (
          <article className="list-row" key={item.id || item.channelId}>
            <Avatar src={item.avatarUrl} name={item.channelName || "C"} />
            <div>
              <h3>{item.channelName || item.channelId}</h3>
              <p className="muted">Subscribed channel</p>
            </div>
          </article>
        ))}
        {!loading && !subscriptions.length ? <p className="muted">No subscriptions yet.</p> : null}
      </section>
    </>
  );
}
