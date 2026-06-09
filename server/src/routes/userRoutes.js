import { Router } from "express";
import { index, show, updateMe, uploadAvatar, uploadBanner } from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.get("/", asyncHandler(index));
router.patch("/me", authenticate, asyncHandler(updateMe));
router.post("/me/avatar", authenticate, upload.single("avatar"), asyncHandler(uploadAvatar));
router.post("/me/banner", authenticate, upload.single("banner"), asyncHandler(uploadBanner));
router.get("/:userId", asyncHandler(show));

export default router;
