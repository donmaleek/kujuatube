INSERT INTO videos (
  id,
  user_id,
  title,
  description,
  category,
  visibility,
  status,
  thumbnail_url,
  duration,
  views,
  likes,
  dislikes
) VALUES
  (
    'video-1',
    'user-1',
    'Getting Started With KujuaTime',
    'A tour of the platform, creator tools, and video workflow.',
    'Education',
    'public',
    'ready',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    '8:42',
    24300,
    980,
    12
  ),
  (
    'video-2',
    'user-1',
    'Designing a Video Pipeline',
    'Upload, metadata, processing queues, thumbnails, and playback explained.',
    'Technology',
    'public',
    'ready',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    '14:06',
    18720,
    742,
    9
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO playlists (id, user_id, title, description, visibility) VALUES
  ('playlist-1', 'user-1', 'Platform Basics', 'Introductory KujuaTime videos.', 'public')
ON CONFLICT (id) DO NOTHING;

INSERT INTO playlist_videos (playlist_id, video_id, position) VALUES
  ('playlist-1', 'video-1', 1),
  ('playlist-1', 'video-2', 2)
ON CONFLICT (playlist_id, video_id) DO NOTHING;
