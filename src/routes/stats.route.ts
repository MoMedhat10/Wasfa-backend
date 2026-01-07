import { Router } from "express";
import { adminRoute } from "../middlewares/protectedRoutes";
import { getDashboardStats } from "../controllers/stats.controller";

const router = Router();

router.get("/", adminRoute, getDashboardStats);

export default router;
