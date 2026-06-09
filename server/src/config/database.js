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
  videos: [
    {
      id: "video-1",
      userId: "user-1",
      channelId: "user-1",
      title: "Getting Started With KujuaTime",
      description: "A tour of the platform, creator tools, and video workflow.",
      category: "Education",
      visibility: "public",
      status: "ready",
      videoUrl: "",
      thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      duration: "8:42",
      views: 24300,
      likes: 980,
      dislikes: 12,
      channelName: "Demo Creator",
      channelHandle: "demo",
      subscribers: 1280,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "video-2",
      userId: "user-1",
      channelId: "user-1",
      title: "Designing a Video Pipeline",
      description: "Upload, metadata, processing queues, thumbnails, and playback explained.",
      category: "Technology",
      visibility: "public",
      status: "ready",
      videoUrl: "",
      thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      duration: "14:06",
      views: 18720,
      likes: 742,
      dislikes: 9,
      channelName: "Demo Creator",
      channelHandle: "demo",
      subscribers: 1280,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "video-3",
      userId: "user-1",
      channelId: "user-1",
      title: "Creator Analytics That Matter",
      description: "A concise look at watch time, views, comments, and retention.",
      category: "Technology",
      visibility: "public",
      status: "ready",
      videoUrl: "",
      thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      duration: "10:18",
      views: 12320,
      likes: 521,
      dislikes: 7,
      channelName: "Demo Creator",
      channelHandle: "demo",
      subscribers: 1280,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "video-5",
      userId: "user-3",
      channelId: "user-3",
      title: "AI Tools Every Small Studio Can Use",
      description: "A practical stack for scripting, thumbnails, captions, editing, repurposing, and audience research.",
      category: "Technology",
      visibility: "public",
      status: "ready",
      videoUrl: "",
      thumbnailUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      duration: "18:20",
      views: 45200,
      likes: 3100,
      dislikes: 31,
      channelName: "Studio Atlas",
      channelHandle: "studioatlas",
      subscribers: 22100,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "video-6",
      userId: "user-2",
      channelId: "user-2",
      title: "Kenyan Street Food Stories in 4K",
      description: "Meet the cooks, customers, and neighborhoods behind late-night plates that travel by word of mouth.",
      category: "Culture",
      visibility: "public",
      status: "ready",
      videoUrl: "",
      thumbnailUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      duration: "9:58",
      views: 38900,
      likes: 2800,
      dislikes: 22,
      channelName: "Nairobi Lens",
      channelHandle: "nairobilens",
      subscribers: 18400,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "video-7",
      userId: "user-3",
      channelId: "user-3",
      title: "How to Grow a Channel From Zero",
      description: "Packaging, audience promises, repeatable series, and the weekly cadence that compounds.",
      category: "Education",
      visibility: "public",
      status: "ready",
      videoUrl: "",
      thumbnailUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      duration: "16:12",
      views: 52100,
      likes: 3600,
      dislikes: 41,
      channelName: "Studio Atlas",
      channelHandle: "studioatlas",
      subscribers: 22100,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "video-8",
      userId: "user-4",
      channelId: "user-4",
      title: "Weekend Football Preview: KE Edition",
      description: "Key matchups, underdog stories, and player form worth watching before the weekend kicks off.",
      category: "Sports",
      visibility: "public",
      status: "ready",
      videoUrl: "",
      thumbnailUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
      duration: "11:36",
      views: 33400,
      likes: 1900,
      dislikes: 35,
      channelName: "Future Pitch",
      channelHandle: "futurepitch",
      subscribers: 9600,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "video-9",
      userId: "user-4",
      channelId: "user-4",
      title: "Indie Game Build Night",
      description: "A fast, watchable breakdown of level design, player feedback, and shipping a playable prototype.",
      category: "Gaming",
      visibility: "public",
      status: "ready",
      videoUrl: "",
      thumbnailUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
      duration: "22:05",
      views: 27600,
      likes: 2100,
      dislikes: 29,
      channelName: "Future Pitch",
      channelHandle: "futurepitch",
      subscribers: 9600,
      createdAt: now,
      updatedAt: now
    }
  ],
  comments: [
    {
      id: "comment-1",
      videoId: "video-1",
      userId: "user-admin",
      authorName: "Admin User",
      body: "The platform is ready for a first deployment pass.",
      createdAt: now,
      updatedAt: now
    }
  ],
  subscriptions: [],
  playlists: [
    {
      id: "playlist-1",
      userId: "user-1",
      title: "Platform Basics",
      description: "Introductory KujuaTime videos.",
      visibility: "public",
      videoIds: ["video-1", "video-2"],
      createdAt: now,
      updatedAt: now
    }
  ],
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
    // Live counts — computed from the in-memory store on every request
    subscribers: db.subscriptions.filter((s) => s.channelId === video.userId).length,
    commentCount: db.comments.filter((c) => c.videoId === video.id).length
  };
}
