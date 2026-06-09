export default function PlaylistCard({ playlist }) {
  if (!playlist) return null;

  const cover = playlist.coverUrl || playlist.videos?.[0]?.thumbnailUrl || "/logo.svg";

  return (
    <article className="playlist-card">
      <a href={`/playlists?id=${playlist.id}`}>
        <img src={cover} alt={playlist.title} loading="lazy" />
        <span>{playlist.videoCount || playlist.videos?.length || 0} videos</span>
      </a>
      <h3>{playlist.title}</h3>
      <p className="muted">{playlist.description || "Curated videos from KujuaTime."}</p>
    </article>
  );
}
