import express from "express";
import { registerUser , loginUser , refreshToken , logoutUser, verifyUser } from "@controllers/auth.controller";
import { protectedRoute } from "@middlewares/protectedRoutes";
const router = express.Router();


router.post("/register" , registerUser);
router.post("/login" , loginUser);
router.post("/refresh-token" , protectedRoute , refreshToken);
router.post("/logout" , protectedRoute , logoutUser);
router.get("/users/:userId/verify/:token" , verifyUser);

export default router;