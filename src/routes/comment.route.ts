import express from "express";
import validateObjectIds from "@middlewares/validateObjectIds";
import { createComment } from "@controllers/comment.controller";
const router = express.Router();




router.route("/")
    .post(createComment)



export default router