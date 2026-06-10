import { createId, db, findUserById, persistDb, publicUser } from "../config/database.js";
import { createCommentModel } from "../models/Comment.js";
import { HttpError, sendCreated } from "../utils/http.js";
import { queueNotification } from "../services/notificationService.js";

export function index(req, res) {
  const { videoId } = req.query;
  const comments = db.comments
    .filter((comment) => !videoId || comment.videoId === videoId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((comment) => {
      // Always use the latest avatar from the user record so profile updates
      // are reflected immediately without needing to re-post.
      const author = findUserById(comment.userId);
      return {
        ...comment,
        authorAvatarUrl: author?.avatarUrl || comment.authorAvatarUrl || ""
      };
    });

  return res.json({ comments });
}

export function store(req, res) {
  const video = db.videos.find((item) => item.id === req.body.videoId);
  if (!video) throw new HttpError(404, "Video not found");

  const comment = createCommentModel({
    id: createId("comment"),
    videoId: req.body.videoId,
    userId: req.user.id,
    authorName: publicUser(req.user).name,
    authorAvatarUrl: req.user.avatarUrl || "",
    body: req.body.body
  });

  db.comments.unshift(comment);
  persistDb();

  if (video.userId !== req.user.id) {
    queueNotification({
      userId: video.userId,
      type: "comment",
      title: `${publicUser(req.user).name} commented on your video`,
      body: comment.body.slice(0, 100),
      videoId: video.id,
      channelName: publicUser(req.user).name
    });
  }

  return sendCreated(res, comment);
}

export function destroy(req, res) {
  const indexToRemove = db.comments.findIndex((comment) => comment.id === req.params.commentId);
  if (indexToRemove === -1) throw new HttpError(404, "Comment not found");
  db.comments.splice(indexToRemove, 1);
  persistDb();
  return res.status(204).send();
}
