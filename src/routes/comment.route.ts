import express from "express";
import validateObjectIds from "@middlewares/validateObjectIds";
import { createComment, deleteComment, getAllComments, updateComment } from "@controllers/comment.controller";
import { adminRoute, protectedRoute } from "@middlewares/protectedRoutes";
const router = express.Router();




router.route("/")
    .post( protectedRoute ,createComment)
    .get(adminRoute , getAllComments)



router.route("/:id")
    .delete(validateObjectIds , protectedRoute , deleteComment)
    .put(validateObjectIds , protectedRoute , updateComment)


export default router