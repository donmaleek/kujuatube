import { Router } from "express";
import { destroy, index, store } from "../controllers/commentController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import { requireFields } from "../middleware/validation.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.get("/", optionalAuth, asyncHandler(index));
router.post("/", authenticate, requireFields(["videoId", "body"]), asyncHandler(store));
router.delete("/:commentId", authenticate, asyncHandler(destroy));

export default router;
