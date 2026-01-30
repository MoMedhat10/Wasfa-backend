import { Router } from "express";
import { getPrices } from "@controllers/payments.controller";

const router = Router();
 
router.get("/prices", getPrices);

export default router;
