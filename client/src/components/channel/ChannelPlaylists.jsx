import PlaylistCard from "../playlist/PlaylistCard.jsx";

export default function ChannelPlaylists({ playlists = [] }) {
  if (!playlists.length) {
    return <p className="muted">No public playlists yet.</p>;
  }

  return (
    <section className="playlist-grid">
      {playlists.map((playlist) => (
        <PlaylistCard playlist={playlist} key={playlist.id} />
      ))}
    </section>
  );
}
