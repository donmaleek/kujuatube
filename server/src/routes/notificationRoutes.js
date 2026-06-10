import { Router } from "express";
import { notificationsIndex, notificationsReadAll } from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(notificationsIndex));
router.post("/read-all", asyncHandler(notificationsReadAll));

export default router;
