import { deleteUserProfile, getUserProfile } from "@controllers/profile.controller";
import { adminRoute, protectedRoute } from "@middlewares/protectedRoutes";
import validateObjectIds from "@middlewares/validateObjectIds";
import express from "express";
const router = express.Router();

router.route("/:id")
    .get(protectedRoute, validateObjectIds, getUserProfile)
    .delete(adminRoute,validateObjectIds, deleteUserProfile);



export default router;
