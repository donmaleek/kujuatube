import { Router } from "express";
import express from "express";
import {
  streamInfo, streamSubscribe, streamInitSegment, streamSegment,
  streamChunk, streamEnd, chatSubscribe, chatSend
} from "../controllers/liveStreamController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

// Video stream — signal via SSE, data via HTTP fetch
router.get("/:liveId/info", asyncHandler(streamInfo));
router.get("/:liveId/stream", streamSubscribe);               // SSE — do not wrap
router.get("/:liveId/init", asyncHandler(streamInitSegment)); // WebM init segment
router.get("/:liveId/segment/:seq", asyncHandler(streamSegment)); // WebM cluster
router.post("/:liveId/chunk", authenticate, express.raw({ type: "*/*", limit: "5mb" }), asyncHandler(streamChunk));
router.post("/:liveId/end", authenticate, asyncHandler(streamEnd));

// Live chat
router.get("/:liveId/chat/stream", chatSubscribe); // SSE — do not wrap
router.post("/:liveId/chat", optionalAuth, asyncHandler(chatSend));

export default router;
