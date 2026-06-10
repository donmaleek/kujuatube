CREATE TABLE watch_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX watch_history_user_id_idx ON watch_history(user_id);
