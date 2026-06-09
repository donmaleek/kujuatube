import { formatDate } from "../../utils/formatDate.js";

export default function CommentItem({ comment }) {
  return (
    <article className="comment">
      <span className="avatar">{(comment.authorName || "U").slice(0, 1)}</span>
      <div>
        <p className="comment-meta">
          <strong>{comment.authorName || "Viewer"}</strong> · {formatDate(comment.createdAt)}
        </p>
        <p>{comment.body}</p>
        <div className="comment-actions">
          <button>Like</button>
          <button>Reply</button>
        </div>
      </div>
    </article>
  );
}
