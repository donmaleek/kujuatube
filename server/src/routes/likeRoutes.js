import { Router } from "express";
import { index, store, destroy } from "../controllers/likeController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import { requireFields } from "../middleware/validation.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.get("/", optionalAuth, asyncHandler(index));
router.post("/", authenticate, requireFields(["videoId"]), asyncHandler(store));
router.delete("/:videoId", authenticate, asyncHandler(destroy));

export default router;
