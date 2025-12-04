import { createRecipe, deleteRecipe, getRecipesCount } from "@controllers/recipe.controller";
import express from "express";
import photoUpload from "@middlewares/imgUpload";
import validateObjectIds from "@middlewares/validateObjectIds";
const router = express.Router();




router.route("/")
   .post(photoUpload.single("image") , createRecipe)


   router.route("/:id")
   .delete(validateObjectIds, deleteRecipe)

router.get("/count", getRecipesCount)


   export default router