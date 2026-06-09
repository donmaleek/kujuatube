import VideoCard from "../common/VideoCard.jsx";

export default function SearchResults({ videos = [] }) {
  if (!videos.length) {
    return (
      <section className="empty-state">
        <h2>No videos found</h2>
        <p>Try another query or remove a filter.</p>
      </section>
    );
  }

  return (
    <section className="search-results">
      {videos.map((video) => (
        <VideoCard video={video} compact key={video.id} />
      ))}
    </section>
  );
}
