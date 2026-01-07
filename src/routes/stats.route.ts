import { Router } from "express";
// import { adminRoute } from "../middlewares/protectedRoutes";
import { getDashboardStats } from "../controllers/stats.controller";

const router = Router();
// adding admin route later
router.get("/", getDashboardStats);

export default router;
