import { Router } from "express";
import { destroy, index, store } from "../controllers/subscriptionController.js";
import { authenticate } from "../middleware/auth.js";
import { requireFields } from "../middleware/validation.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.get("/", authenticate, asyncHandler(index));
router.post("/", authenticate, requireFields(["channelId"]), asyncHandler(store));
router.delete("/:channelId", authenticate, asyncHandler(destroy));

export default router;
