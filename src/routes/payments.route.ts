import { Router } from "express";
import { createCheckoutSession, createPortalSession, getPrices } from "@controllers/payments.controller";
import { protectedRoute } from "@middlewares/protectedRoutes";

const router = Router();

router.get("/prices", getPrices);

router.get("/create-portal-session", protectedRoute, createPortalSession);


router.post("/checkout-session", protectedRoute, createCheckoutSession);

export default router;



