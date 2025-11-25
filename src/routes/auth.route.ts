import express from "express";
import { registerUser , loginUser } from "@controllers/auth.controller";
import { refreshToken } from "@controllers/auth.controller";
import { protectedRoute } from "@middlewares/protectedRoutes";
const router = express.Router();


router.post("/register" , registerUser);
router.post("/login" , loginUser);
router.post("/refresh-token" , protectedRoute , refreshToken);

export default router;