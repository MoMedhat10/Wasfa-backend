import express from "express";
import validateObjectIds from "@middlewares/validateObjectIds";
import { createComment, getAllComments } from "@controllers/comment.controller";
const router = express.Router();




router.route("/")
    .post(createComment)
    .get(getAllComments)



export default router