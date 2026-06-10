# Database Schema

The SQL schema lives in `database/schema/schema.sql`. Migrations are stored in timestamp order under `database/migrations/`.

Core tables:

- `users` - accounts, roles, profile metadata, password hashes.
- `categories` - allowed video categories.
- `videos` - video metadata, visibility, processing status, URLs, engagement counters.
- `comments` - video comments by users.
- `subscriptions` - user-to-channel relationships.
- `playlists` - playlist metadata.
- `playlist_videos` - ordered playlist membership.
- `likes` - one like or dislike per user/video.
- `watch_history` - user viewing activity.
- `reports` - moderation reports.

The API can run immediately with `DATA_FILE`, a JSON-backed persistent store mounted in Docker. Recommended production database for scale: PostgreSQL, using this schema as the migration target.

Seed data:

```sh
psql "$DATABASE_URL" -f database/schema/schema.sql
psql "$DATABASE_URL" -f database/seeders/demo_categories.sql
psql "$DATABASE_URL" -f database/seeders/demo_users.sql
psql "$DATABASE_URL" -f database/seeders/demo_videos.sql
```
