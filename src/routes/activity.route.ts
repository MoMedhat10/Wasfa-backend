import express from "express";
import { getRecentActivities } from "../controllers/activity.controller";
import { adminRoute } from "@middlewares/protectedRoutes";


const router = express.Router();

// /api/activities
router.route("/")
    .get(adminRoute, getRecentActivities);

export default router;
