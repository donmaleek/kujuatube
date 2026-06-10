# Video Pipeline

The MVP supports URL-based video publishing and includes service boundaries for production media processing.

## Current Flow

1. Creator signs in.
2. Creator submits title, description, category, visibility, optional video URL, and thumbnail URL.
3. API creates a `videos` record with status `ready`.
4. Client renders the video using the URL when present, or a preview state when absent.

## Production Flow

1. Client uploads raw file through an authenticated endpoint using `server/src/middleware/upload.js`.
2. `s3Upload.js` stores the raw asset in object storage.
3. `videoTranscodeJob.js` queues encoding through `videoEncoder.js`.
4. `thumbnailGenerator.js` creates thumbnails.
5. Video status moves from `processing` to `ready`.
6. Playback serves adaptive renditions from CDN-backed storage.

## Local Storage

Development paths:

- `storage/videos/raw/`
- `storage/videos/processed/360p/`
- `storage/videos/processed/720p/`
- `storage/videos/processed/1080p/`
- `storage/videos/thumbnails/`
- `storage/uploads/temp/`
