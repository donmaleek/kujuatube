import { Router } from "express";
import { index } from "../controllers/searchController.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.get("/", asyncHandler(index));

export default router;
