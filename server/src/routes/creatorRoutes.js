import { Router } from "express";
import {
  launchKitIndex,
  launchKitStore,
  liveIndex,
  liveStore,
  postsIndex,
  postsStore
} from "../controllers/creatorController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.use(authenticate);

router.get("/posts", asyncHandler(postsIndex));
router.post("/posts", asyncHandler(postsStore));
router.get("/live", asyncHandler(liveIndex));
router.post("/live", asyncHandler(liveStore));
router.get("/launch-kits", asyncHandler(launchKitIndex));
router.post("/launch-kit", asyncHandler(launchKitStore));

export default router;
