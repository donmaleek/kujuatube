import VideoCard from "../common/VideoCard.jsx";

export default function ChannelVideos({ videos = [] }) {
  return (
    <section className="video-grid">
      {videos.map((video) => (
        <VideoCard video={video} key={video.id} />
      ))}
    </section>
  );
}
