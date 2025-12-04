import express from "express";
import validateObjectIds from "@middlewares/validateObjectIds";
import { createComment, deleteComment, getAllComments } from "@controllers/comment.controller";
const router = express.Router();




router.route("/")
    .post(createComment)
    .get(getAllComments)



router.route("/:id")
    .delete(validateObjectIds , deleteComment)


export default router