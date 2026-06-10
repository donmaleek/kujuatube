import {
  createCreatorPost,
  createLaunchKit,
  createLiveRoom,
  listCreatorPosts,
  listLaunchKits,
  listLiveRooms
} from "../services/creatorWorkflowService.js";
import { sendCreated } from "../utils/http.js";

export function postsIndex(req, res) {
  return res.json({ posts: listCreatorPosts(req.user.id) });
}

export function postsStore(req, res) {
  return sendCreated(res, createCreatorPost(req.user, req.body));
}

export function liveIndex(req, res) {
  return res.json({ liveRooms: listLiveRooms(req.user.id) });
}

export function liveStore(req, res) {
  return sendCreated(res, createLiveRoom(req.user, req.body));
}

export function launchKitIndex(req, res) {
  return res.json({ launchKits: listLaunchKits(req.user.id) });
}

export function launchKitStore(req, res) {
  return sendCreated(res, createLaunchKit(req.user, req.body));
}
