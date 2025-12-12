import express from "express";
import { registerUser, loginUser, refreshToken, logoutUser, verifyUser, resendVerificationToken } from "@controllers/auth.controller";
import { protectedRoute } from "@middlewares/protectedRoutes";
const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", protectedRoute, refreshToken);
router.post("/logout", logoutUser);
router.get("/users/:userId/verify/:token", verifyUser);
router.post("/users/:userId/resend-verification-token", resendVerificationToken);

export default router;