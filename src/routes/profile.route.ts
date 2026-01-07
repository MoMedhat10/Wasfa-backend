import { deleteUserProfile, getUserProfile } from "@controllers/profile.controller";
import { protectedRoute } from "@middlewares/protectedRoutes";
import validateObjectIds from "@middlewares/validateObjectIds";
import express from "express";
const router = express.Router();

router.route("/:id")
    .get(protectedRoute, validateObjectIds, getUserProfile)
    .delete(protectedRoute, validateObjectIds, deleteUserProfile);


// router.route("/toggle-ban/:id").put(protectedRoute, validateObjectIds, toggleBanUser);


export default router;
