import { Router } from "express";
import { index, recommendations, show, store } from "../controllers/videoController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { requireFields } from "../middleware/validation.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.get("/", optionalAuth, asyncHandler(index));
router.post(
  "/",
  authenticate,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  requireFields(["title"]),
  asyncHandler(store)
);
router.get("/:videoId/recommendations", optionalAuth, asyncHandler(recommendations));
router.get("/:videoId", optionalAuth, asyncHandler(show));

export default router;
