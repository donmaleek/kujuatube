import { Router } from "express";
import { addVideo, index, store } from "../controllers/playlistController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import { requireFields } from "../middleware/validation.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.get("/", optionalAuth, asyncHandler(index));
router.post("/", authenticate, requireFields(["title"]), asyncHandler(store));
router.post("/:playlistId/videos", authenticate, requireFields(["videoId"]), asyncHandler(addVideo));

export default router;
