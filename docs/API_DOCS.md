# API Docs

Base URL: `/api`

## Auth

- `POST /auth/register` - create user and return `{ token, user }`.
- `POST /auth/login` - authenticate and return `{ token, user }`.
- `GET /auth/me` - return current user. Requires bearer token.

## Videos

- `GET /videos?q=&category=&sort=&channelId=` - list public videos.
- `GET /videos/:videoId` - fetch one video and increment views.
- `POST /videos` - create a video. Requires bearer token. Accepts JSON metadata or `multipart/form-data` with `video` and optional `thumbnail` files plus `title`, `description`, `category`, `visibility`, and `duration` fields.
- `GET /videos/:videoId/recommendations` - related videos.

## Comments

- `GET /comments?videoId=` - list comments.
- `POST /comments` - create a comment with `{ videoId, body }`. Requires bearer token.
- `DELETE /comments/:commentId` - delete a comment. Requires bearer token.

## User Activity

- `GET /subscriptions` - list subscriptions. Requires bearer token.
- `POST /subscriptions` - subscribe with `{ channelId }`. Requires bearer token.
- `DELETE /subscriptions/:channelId` - unsubscribe. Requires bearer token.
- `GET /playlists` - list visible playlists.
- `POST /playlists` - create playlist. Requires bearer token.
- `POST /playlists/:playlistId/videos` - add video to playlist. Requires bearer token.
- `POST /likes` - like or dislike with `{ videoId, value }`. Requires bearer token.
- `GET /history` - watch history. Requires bearer token.
- `POST /history` - append watch history. Requires bearer token.

## Discovery

- `GET /search` - same query options as `/videos`.
- `GET /trending` - most viewed public videos.

## Admin

All admin routes require an admin bearer token.

- `GET /admin/summary`
- `GET /admin/analytics`
- `GET /admin/reports`
