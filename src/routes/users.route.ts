
import { Router } from "express";
import { adminRoute } from "../middlewares/protectedRoutes";
import { getAllUsers, toggleBanUser } from "../controllers/users.controller";
import validateObjectIds from "@middlewares/validateObjectIds";

const router = Router();

router.get("/", adminRoute, getAllUsers);
router.put("/toggle-ban/:id", adminRoute, validateObjectIds, toggleBanUser);

export default router;
