export function createUserModel({ id, name, email, passwordHash, role = "viewer", avatarUrl = "", bannerUrl = "", bio = "", channelHandle = "" }) {
  const timestamp = new Date().toISOString();
  return {
    id,
    name,
    email,
    passwordHash,
    role,
    avatarUrl,
    bannerUrl,
    bio,
    channelHandle,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function toPublicUser(user) {
  if (!user) return null;
  const { passwordHash, ...publicFields } = user;
  return publicFields;
}
