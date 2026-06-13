import { useEffect, useState } from "react";
import YoutubeIcon from "../components/common/YoutubeIcon.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { listMyVideos, updateVideo, deleteVideo } from "../services/videoService.js";
import { VIDEO_CATEGORIES } from "../utils/constants.js";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function fmtViews(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
}

const EMPTY_EDIT = { title: "", description: "", category: "Education", visibility: "public" };

export default function CreatorStudio() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit modal state
  const [editTarget, setEditTarget] = useState(null);
  const [editValues, setEditValues] = useState(EMPTY_EDIT);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    listMyVideos()
      .then((data) => setVideos(data.videos || []))
      .catch((err) => setError(err.message || "Failed to load videos"))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="studio-empty">
        <p>You need to be signed in to manage your videos.</p>
        <a className="button primary" href="/login?next=%2Fstudio">Sign in</a>
      </div>
    );
  }

  function openEdit(video) {
    setEditTarget(video);
    setEditValues({
      title: video.title || "",
      description: video.description || "",
      category: video.category || "Education",
      visibility: video.visibility || "public"
    });
    setSaveError("");
  }

  function closeEdit() {
    setEditTarget(null);
    setSaveError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!editValues.title.trim()) { setSaveError("Title is required."); return; }
    setSaving(true);
    setSaveError("");
    try {
      const updated = await updateVideo(editTarget.id, editValues);
      setVideos((prev) => prev.map((v) => v.id === updated.id ? updated : v));
      closeEdit();
    } catch (err) {
      setSaveError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleVisibility(video) {
    const nextVisibility = video.visibility === "public" ? "private" : "public";
    try {
      const updated = await updateVideo(video.id, { visibility: nextVisibility });
      setVideos((prev) => prev.map((v) => v.id === updated.id ? updated : v));
    } catch (err) {
      alert(err.message || "Failed to update visibility.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVideo(deleteTarget.id);
      setVideos((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <section className="page-heading with-action">
        <div>
          <h1>Your Videos</h1>
          <p>{videos.length} video{videos.length !== 1 ? "s" : ""} published</p>
        </div>
        <a className="button primary" href="/upload">
          <YoutubeIcon name="upload" size={18} />
          Upload video
        </a>
      </section>

      {loading && <LoadingSpinner label="Loading your videos" />}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && videos.length === 0 && (
        <div className="studio-empty">
          <YoutubeIcon name="yourVideos" size={56} />
          <h2>No videos yet</h2>
          <p>Upload your first video to get started.</p>
          <a className="button primary" href="/upload">Upload video</a>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div className="studio-table-wrap">
          <table className="studio-table">
            <thead>
              <tr>
                <th>Video</th>
                <th>Status</th>
                <th>Views</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} className={video.visibility === "private" ? "studio-row unpublished" : "studio-row"}>
                  <td className="studio-cell-title">
                    <a href={`/watch?id=${video.id}`} className="studio-thumb-link">
                      {video.thumbnailUrl
                        ? <img src={video.thumbnailUrl} alt="" className="studio-thumb" loading="lazy" />
                        : <div className="studio-thumb studio-thumb-placeholder"><YoutubeIcon name="play" size={24} /></div>}
                    </a>
                    <div className="studio-video-meta">
                      <a href={`/watch?id=${video.id}`} className="studio-video-title">{video.title}</a>
                      {video.description && (
                        <p className="studio-video-desc">{video.description}</p>
                      )}
                      <span className="studio-category-badge">{video.category}</span>
                    </div>
                  </td>
                  <td>
                    <span className={video.visibility === "public" ? "studio-status published" : "studio-status unpublished"}>
                      {video.visibility === "public" ? "Public" : "Private"}
                    </span>
                  </td>
                  <td className="studio-cell-num">{fmtViews(video.views || 0)}</td>
                  <td className="studio-cell-num">{fmtDate(video.createdAt)}</td>
                  <td className="studio-cell-actions">
                    <button
                      className="icon-button"
                      title="Edit"
                      onClick={() => openEdit(video)}
                      type="button"
                    >
                      <YoutubeIcon name="edit" size={18} />
                    </button>
                    <button
                      className={video.visibility === "public" ? "icon-button studio-unpublish-btn" : "icon-button studio-publish-btn"}
                      title={video.visibility === "public" ? "Unpublish (make private)" : "Publish (make public)"}
                      onClick={() => handleToggleVisibility(video)}
                      type="button"
                    >
                      <YoutubeIcon name={video.visibility === "public" ? "eyeOff" : "eye"} size={18} />
                    </button>
                    <button
                      className="icon-button studio-delete-btn"
                      title="Delete"
                      onClick={() => setDeleteTarget(video)}
                      type="button"
                    >
                      <YoutubeIcon name="delete" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editTarget && (
        <div className="modal-backdrop" onClick={closeEdit}>
          <div className="modal studio-edit-modal" onClick={(e) => e.stopPropagation()}>
            <header>
              <h2>Edit video</h2>
              <button className="icon-button" onClick={closeEdit} type="button" aria-label="Close">
                <YoutubeIcon name="close" size={20} />
              </button>
            </header>

            <form onSubmit={handleSave} className="studio-edit-form">
              <label>
                Title
                <input
                  value={editValues.title}
                  onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  value={editValues.description}
                  onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                  rows={4}
                  maxLength={5000}
                />
              </label>

              <div className="studio-edit-row">
                <label>
                  Category
                  <select
                    value={editValues.category}
                    onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                  >
                    {VIDEO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Visibility
                  <select
                    value={editValues.visibility}
                    onChange={(e) => setEditValues({ ...editValues, visibility: e.target.value })}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private (unpublished)</option>
                  </select>
                </label>
              </div>

              {saveError && <p className="error-text">{saveError}</p>}

              <div className="studio-edit-actions">
                <button type="button" className="button secondary" onClick={closeEdit}>Cancel</button>
                <button type="submit" className="button primary" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <header>
              <h2>Delete video?</h2>
              <button className="icon-button" onClick={() => setDeleteTarget(null)} type="button" aria-label="Close">
                <YoutubeIcon name="close" size={20} />
              </button>
            </header>
            <p>
              <strong>"{deleteTarget.title}"</strong> will be permanently deleted. This cannot be undone.
            </p>
            <div className="studio-edit-actions">
              <button type="button" className="button secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="button danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
