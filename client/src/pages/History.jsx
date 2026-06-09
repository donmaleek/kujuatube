import VideoCard from "../components/common/VideoCard.jsx";
import { useWatchHistory } from "../hooks/useWatchHistory.js";

export default function History() {
  const { history, clearHistory } = useWatchHistory();

  return (
    <>
      <section className="page-heading with-action">
        <div>
          <h1>History</h1>
          <p>Videos you watched on this device.</p>
        </div>
        <button className="button" onClick={clearHistory}>Clear</button>
      </section>
      <section className="search-results">
        {history.map((video) => (
          <VideoCard video={video} compact key={video.id} />
        ))}
        {!history.length ? <p className="muted">No watch history yet.</p> : null}
      </section>
    </>
  );
}
