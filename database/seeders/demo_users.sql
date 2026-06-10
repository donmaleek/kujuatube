INSERT INTO users (id, name, email, password_hash, role, bio) VALUES
  ('user-1', 'Demo Creator', 'demo@kujuatime.com', '120000:demo-user-salt:9019ee2d1696d6a14894c9f6b8bcb5800e8ee49a4c3c35f94993ea5889855e29', 'creator', 'Building practical knowledge videos.'),
  ('user-admin', 'Admin User', 'admin@kujuatime.com', '120000:admin-user-salt:79c3d45608620e3c7eb7444f8ad5eac46a94467526aad9e37d9d48d8b241b0c0', 'admin', 'KujuaTime administrator.')
ON CONFLICT (email) DO NOTHING;
