import { createId, db, persistDb } from "../config/database.js";
import { queueNotification } from "./notificationService.js";
import { HttpError } from "../utils/http.js";

function cleanText(value = "", fallback = "") {
  const nextValue = String(value || "").replace(/\s+/g, " ").trim();
  return nextValue || fallback;
}

function getCreatorName(user) {
  return user?.name || user?.email || "KujuaTime Creator";
}

function buildLaunchKit(idea = "", region = "US") {
  const subject = cleanText(idea, "your next creator drop");
  return {
    title: `${subject}: what viewers need to know`,
    hook: "Open with the viewer's problem, show the promised result, then give a quick proof point in the first 12 seconds.",
    thumbnail: "Use one expressive face or object, one clear contrast, and a three-word purple-accent headline.",
    publishWindow: `${region} prime window: 7:00 PM - 9:00 PM`,
    chapters: ["Cold open", "Proof or story", "Main value", "Viewer action"],
    tags: ["#KujuaTime", "#CreatorGrowth", "#LearnWithMe", "#VideoStrategy"],
    checklist: ["Record a 5-second hook test", "Prepare one short clip", "Pin the strongest viewer question", "Post a follow-up within 24 hours"]
  };
}

export function listCreatorPosts(userId) {
  return db.creatorPosts.filter((post) => post.userId === userId);
}

export function createCreatorPost(user, payload = {}) {
  const body = cleanText(payload.body);
  if (!body) throw new HttpError(400, "Post body is required");

  const timestamp = new Date().toISOString();
  const post = {
    id: createId("post"),
    userId: user.id,
    authorName: getCreatorName(user),
    body,
    visibility: payload.visibility || "public",
    status: payload.status || "published",
    reactions: 0,
    comments: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  db.creatorPosts.unshift(post);
  persistDb();
  return post;
}

export function listLiveRooms(userId) {
  return db.liveRooms.filter((room) => room.userId === userId);
}

export function createLiveRoom(user, payload = {}) {
  const title = cleanText(payload.title);
  if (!title) throw new HttpError(400, "Live title is required");

  const timestamp = new Date().toISOString();
  const id = createId("live");
  const streamKey = `kt-${id.replace("live-", "").slice(0, 18)}`;
  const room = {
    id,
    userId: user.id,
    hostName: getCreatorName(user),
    title,
    format: payload.format || "Studio live",
    visibility: payload.visibility || "public",
    status: "ready",
    ingestUrl: "rtmp://live.kujuatime.com/app",
    streamKey,
    shareUrl: `/live/${id}`,
    startedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  db.liveRooms.unshift(room);
  persistDb();

  db.subscriptions
    .filter((s) => s.channelId === user.id)
    .forEach((s) => {
      queueNotification({
        userId: s.userId,
        type: "live",
        title: `${getCreatorName(user)} is live now`,
        body: room.title,
        videoId: room.id,
        channelName: getCreatorName(user)
      });
    });

  return room;
}

export function listLaunchKits(userId) {
  return db.launchKits.filter((kit) => kit.userId === userId);
}

export function createLaunchKit(user, payload = {}) {
  const idea = cleanText(payload.idea, "your next creator drop");
  const timestamp = new Date().toISOString();
  const launchKit = {
    id: createId("launch-kit"),
    userId: user.id,
    creatorName: getCreatorName(user),
    idea,
    region: payload.region || "US",
    kit: buildLaunchKit(idea, payload.region || "US"),
    createdAt: timestamp,
    updatedAt: timestamp
  };

  db.launchKits.unshift(launchKit);
  persistDb();
  return launchKit;
}
