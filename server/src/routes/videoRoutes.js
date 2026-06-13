import { Router } from "express";
import { index, my, recommendations, show, store, update, destroy } from "../controllers/videoController.js";
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
router.get("/my", authenticate, asyncHandler(my));
router.get("/:videoId/recommendations", optionalAuth, asyncHandler(recommendations));
router.get("/:videoId", optionalAuth, asyncHandler(show));
router.patch(
  "/:videoId",
  authenticate,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  asyncHandler(update)
);
router.delete("/:videoId", authenticate, asyncHandler(destroy));

export default router;
