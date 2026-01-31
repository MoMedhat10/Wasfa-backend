import { Router } from "express";
import { createCheckoutSession, getPrices } from "@controllers/payments.controller";
import { protectedRoute } from "@middlewares/protectedRoutes";

const router = Router();

router.get("/prices", getPrices);

router.post("/checkout-session", protectedRoute, createCheckoutSession);

export default router;



