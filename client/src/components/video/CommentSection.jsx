import { useState } from "react";
import { useComments } from "../../hooks/useComments.js";
import { useAuth } from "../../hooks/useAuth.js";
import CommentItem from "./CommentItem.jsx";
import LoadingSpinner from "../common/LoadingSpinner.jsx";

const uploadLoginPath = "/login?next=%2Fupload";

export default function CommentSection({ videoId }) {
  const { user } = useAuth();
  const { comments, loading, error, submitComment } = useComments(videoId);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (!body.trim()) return;

    setSaving(true);
    await submitComment(body.trim());
    setBody("");
    setSaving(false);
  }

  return (
    <section className="comments-section">
      <div className="comments-header">
        <h2>{comments.length} comments</h2>
        <button className="watch-action-pill">Sort by</button>
      </div>
      {user ? (
        <form className="comment-form" onSubmit={onSubmit}>
          <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Add a comment" rows="3" />
          <div className="comment-form-actions">
            <button className="button ghost" type="button" onClick={() => setBody("")}>Cancel</button>
            <button className="button primary" disabled={saving}>
              {saving ? "Posting" : "Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-signin-box">
          <p>Sign in to join the conversation.</p>
          <a className="youtube-signin-button" href={uploadLoginPath}>Sign in</a>
        </div>
      )}
      {loading ? <LoadingSpinner label="Loading comments" /> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="comment-list">
        {comments.map((comment) => (
          <CommentItem comment={comment} key={comment.id} />
        ))}
      </div>
    </section>
  );
}
