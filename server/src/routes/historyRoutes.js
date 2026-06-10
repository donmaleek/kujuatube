import { Router } from "express";
import { index, store } from "../controllers/historyController.js";
import { authenticate } from "../middleware/auth.js";
import { requireFields } from "../middleware/validation.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.get("/", authenticate, asyncHandler(index));
router.post("/", authenticate, requireFields(["videoId"]), asyncHandler(store));

export default router;
