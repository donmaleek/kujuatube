import { db, findUserById, persistDb, publicUser } from "../config/database.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http.js";

function uploadedFileUrl(file) {
  if (!file?.filename) return "";
  return `${env.publicBaseUrl.replace(/\/$/, "")}/uploads/${encodeURIComponent(file.filename)}`;
}

export function index(_req, res) {
  return res.json({ users: db.users.map(publicUser) });
}

export function show(req, res) {
  const user = findUserById(req.params.userId);
  if (!user) throw new HttpError(404, "User not found");
  return res.json(publicUser(user));
}

export function updateMe(req, res) {
  const user = findUserById(req.user.id);
  Object.assign(user, {
    name: req.body.name ?? user.name,
    bio: req.body.bio ?? user.bio,
    avatarUrl: req.body.avatarUrl ?? user.avatarUrl,
    bannerUrl: req.body.bannerUrl ?? user.bannerUrl ?? "",
    channelHandle: req.body.channelHandle ?? user.channelHandle ?? "",
    updatedAt: new Date().toISOString()
  });
  persistDb();
  return res.json(publicUser(user));
}

export function uploadAvatar(req, res) {
  const user = findUserById(req.user.id);
  const avatarUrl = uploadedFileUrl(req.file);
  if (!avatarUrl) throw new HttpError(400, "No image file provided");
  user.avatarUrl = avatarUrl;
  user.updatedAt = new Date().toISOString();
  persistDb();
  return res.json(publicUser(user));
}

export function uploadBanner(req, res) {
  const user = findUserById(req.user.id);
  const bannerUrl = uploadedFileUrl(req.file);
  if (!bannerUrl) throw new HttpError(400, "No image file provided");
  user.bannerUrl = bannerUrl;
  user.updatedAt = new Date().toISOString();
  persistDb();
  return res.json(publicUser(user));
}
