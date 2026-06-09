import { useState } from "react";

export default function AddToPlaylistButton({ playlists = [], onAdd }) {
  const [playlistId, setPlaylistId] = useState(playlists[0]?.id || "");

  return (
    <div className="inline-form">
      <select value={playlistId} onChange={(event) => setPlaylistId(event.target.value)}>
        {playlists.map((playlist) => (
          <option value={playlist.id} key={playlist.id}>
            {playlist.title}
          </option>
        ))}
      </select>
      <button className="button" onClick={() => playlistId && onAdd?.(playlistId)} disabled={!playlistId}>
        Save
      </button>
    </div>
  );
}
