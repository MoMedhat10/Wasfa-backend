import express from "express";
import { getRecentActivities } from "../controllers/activity.controller";
// import { adminRoute } from "@middlewares/protectedRoutes";


const router = express.Router();

// adding admin route later
router.route("/")
    .get( getRecentActivities);

export default router;
