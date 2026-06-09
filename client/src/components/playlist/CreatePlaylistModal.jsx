import { useState } from "react";

export default function CreatePlaylistModal({ open, onClose, onCreate }) {
  const [values, setValues] = useState({ title: "", description: "", visibility: "public" });

  if (!open) return null;

  function submit(event) {
    event.preventDefault();
    onCreate(values);
    setValues({ title: "", description: "", visibility: "public" });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" onSubmit={submit}>
        <header>
          <h2>Create playlist</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            x
          </button>
        </header>
        <label>
          Title
          <input value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} required />
        </label>
        <label>
          Description
          <textarea
            value={values.description}
            onChange={(event) => setValues({ ...values, description: event.target.value })}
            rows="4"
          />
        </label>
        <label>
          Visibility
          <select value={values.visibility} onChange={(event) => setValues({ ...values, visibility: event.target.value })}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>
        <button className="button primary">Create</button>
      </form>
    </div>
  );
}
