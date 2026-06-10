INSERT INTO categories (id, name, description) VALUES
  ('category-education', 'Education', 'Learning, tutorials, and practical knowledge'),
  ('category-technology', 'Technology', 'Software, devices, and engineering'),
  ('category-music', 'Music', 'Music videos and performances'),
  ('category-culture', 'Culture', 'Culture, people, and society'),
  ('category-news', 'News', 'News and current events'),
  ('category-sports', 'Sports', 'Sports videos and analysis')
ON CONFLICT (name) DO NOTHING;
