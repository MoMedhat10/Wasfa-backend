import { getResetPasswordLink, resetPassword, sentResetPasswordLink } from "@controllers/password.controller";
import express from "express";
const router = express.Router();


router.post("/reset-link", sentResetPasswordLink);

router.route("/reset-password/:userId/:token")
   .get(getResetPasswordLink)
   .post(resetPassword);

export default router;
