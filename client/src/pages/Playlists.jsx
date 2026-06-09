import { useState } from "react";
import CreatePlaylistModal from "../components/playlist/CreatePlaylistModal.jsx";
import PlaylistCard from "../components/playlist/PlaylistCard.jsx";

export default function Playlists() {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState([
    { id: "featured", title: "Featured learning", description: "Helpful videos to start with.", videoCount: 3 },
    { id: "watch-later", title: "Watch later", description: "Videos saved for later.", videoCount: 0 }
  ]);

  function createPlaylist(values) {
    setPlaylists((current) => [{ ...values, id: crypto.randomUUID(), videoCount: 0 }, ...current]);
    setOpen(false);
  }

  return (
    <>
      <section className="page-heading with-action">
        <div>
          <h1>Playlists</h1>
          <p>Organize videos into public or private collections.</p>
        </div>
        <button className="button primary" onClick={() => setOpen(true)}>New playlist</button>
      </section>
      <section className="playlist-grid">
        {playlists.map((playlist) => (
          <PlaylistCard playlist={playlist} key={playlist.id} />
        ))}
      </section>
      <CreatePlaylistModal open={open} onClose={() => setOpen(false)} onCreate={createPlaylist} />
    </>
  );
}
