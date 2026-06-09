import VideoCard from "../common/VideoCard.jsx";

export default function RecommendedVideos({ videos = [], currentVideoId }) {
  const recommendations = videos.filter((video) => video.id !== currentVideoId).slice(0, 8);

  return (
    <aside className="recommendations">
      <div className="recommendation-filter-row">
        <button className="active">All</button>
        <button>Related</button>
        <button>Recently uploaded</button>
      </div>
      {recommendations.map((video) => (
        <VideoCard video={video} compact key={video.id} />
      ))}
    </aside>
  );
}
