import VideoCard from "../components/common/VideoCard.jsx";
import PlaylistCard from "../components/playlist/PlaylistCard.jsx";
import { useWatchHistory } from "../hooks/useWatchHistory.js";

export default function Library() {
  const { history } = useWatchHistory();
  const recent = history.slice(0, 4);

  return (
    <>
      <section className="page-heading">
        <h1>Library</h1>
        <p>Your saved activity and playlists.</p>
      </section>
      <h2>Recently watched</h2>
      <section className="video-grid">
        {recent.map((video) => (
          <VideoCard video={video} key={video.id} />
        ))}
      </section>
      <h2>Quick playlists</h2>
      <section className="playlist-grid">
        <PlaylistCard playlist={{ id: "watch-later", title: "Watch later", videoCount: 0 }} />
        <PlaylistCard playlist={{ id: "favorites", title: "Favorites", videoCount: 0 }} />
      </section>
    </>
  );
}
