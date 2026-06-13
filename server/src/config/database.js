import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "./env.js";
import { hashPasswordSync } from "../utils/hashPassword.js";

const now = new Date().toISOString();

export function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

const seedDb = {
  users: [
    {
      id: "user-1",
      name: "Demo Creator",
      email: "demo@kujuatime.com",
      passwordHash: hashPasswordSync("Password123!", "demo-user-salt"),
      role: "creator",
      avatarUrl: "",
      bannerUrl: "",
      channelHandle: "democreator",
      bio: "Building practical knowledge videos.",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "user-admin",
      name: "Admin User",
      email: "admin@kujuatime.com",
      passwordHash: hashPasswordSync("Password123!", "admin-user-salt"),
      role: "admin",
      avatarUrl: "",
      bannerUrl: "",
      channelHandle: "admin",
      bio: "KujuaTime administrator.",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "user-2",
      name: "Nairobi Lens",
      email: "nairobi@kujuatime.com",
      passwordHash: hashPasswordSync("Password123!", "nairobi-lens-salt"),
      role: "creator",
      avatarUrl: "",
      bannerUrl: "",
      channelHandle: "nairobilens",
      bio: "Culture, food, and city stories from Kenya.",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "user-3",
      name: "Studio Atlas",
      email: "studio@kujuatime.com",
      passwordHash: hashPasswordSync("Password123!", "studio-atlas-salt"),
      role: "creator",
      avatarUrl: "",
      bannerUrl: "",
      channelHandle: "studioatlas",
      bio: "Creator craft, production systems, and studio growth.",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "user-4",
      name: "Future Pitch",
      email: "future@kujuatime.com",
      passwordHash: hashPasswordSync("Password123!", "future-pitch-salt"),
      role: "creator",
      avatarUrl: "",
      bannerUrl: "",
      channelHandle: "futurepitch",
      bio: "Technology, sports, and gaming stories with a future-facing lens.",
      createdAt: now,
      updatedAt: now
    }
  ],
  videos: [],
  comments: [],
  subscriptions: [],
  playlists: [],
  likes: [],
  watchHistory: [],
  reports: [],
  creatorPosts: [],
  liveRooms: [],
  launchKits: [],
  notifications: [],
  categories: ["Education", "Technology", "Music", "Culture", "News", "Sports", "Gaming"]
};

function mergeDb(savedDb = {}) {
  return Object.fromEntries(
    Object.entries(seedDb).map(([key, value]) => [key, Array.isArray(value) ? savedDb[key] || value : savedDb[key] || value])
  );
}

function loadDb() {
  if (!env.dataFile) return seedDb;

  const filePath = path.resolve(env.dataFile);
  if (!fs.existsSync(filePath)) return seedDb;

  try {
    return mergeDb(JSON.parse(fs.readFileSync(filePath, "utf8")));
  } catch (error) {
    console.warn(`Could not load DATA_FILE at ${filePath}: ${error.message}`);
    return seedDb;
  }
}

export const db = loadDb();

export function persistDb() {
  if (!env.dataFile || env.nodeEnv === "test") return;

  const filePath = path.resolve(env.dataFile);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
}

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return {
    bannerUrl: "",
    channelHandle: "",
    ...safeUser,
    subscribers: db.subscriptions.filter((s) => s.channelId === user.id).length
  };
}

export function findUserById(userId) {
  return db.users.find((user) => user.id === userId);
}

export function findUserByEmail(email = "") {
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function publicVideo(video) {
  const owner = findUserById(video.userId);
  return {
    ...video,
    ownerName: owner?.name || video.channelName || "KujuaTime Creator",
    channelName: video.channelName || owner?.name || "KujuaTime Creator",
    channelAvatarUrl: owner?.avatarUrl || "",
    subscribers: db.subscriptions.filter((s) => s.channelId === video.userId).length,
    commentCount: db.comments.filter((c) => c.videoId === video.id).length
  };
}
