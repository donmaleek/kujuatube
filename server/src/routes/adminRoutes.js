import { Router } from "express";
import { analytics, reports, summary } from "../controllers/adminController.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.use(authenticate, requireRole("admin"));
router.get("/summary", asyncHandler(summary));
router.get("/analytics", asyncHandler(analytics));
router.get("/reports", asyncHandler(reports));

export default router;
