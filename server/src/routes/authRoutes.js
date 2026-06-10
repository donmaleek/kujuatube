import { Router } from "express";
import { login, me, register } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { requireFields, validateEmail } from "../middleware/validation.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.post("/register", requireFields(["name", "email", "password"]), validateEmail, asyncHandler(register));
router.post("/login", requireFields(["email", "password"]), validateEmail, asyncHandler(login));
router.get("/me", authenticate, asyncHandler(me));

export default router;
