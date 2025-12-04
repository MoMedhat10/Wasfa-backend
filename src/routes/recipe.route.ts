import { createRecipe, deleteRecipe, getRecipe, getRecipes, getRecipesCount, updateRecipe, updateRecipeImage } from "@controllers/recipe.controller";
import express from "express";
import photoUpload from "@middlewares/imgUpload";
import validateObjectIds from "@middlewares/validateObjectIds";
const router = express.Router();




router.route("/")
   .post(photoUpload.single("image") , createRecipe)
   .get(getRecipes)


   router.route("/:id")
   .delete(validateObjectIds, deleteRecipe)
   .get(validateObjectIds, getRecipe)
   .put(validateObjectIds, updateRecipe)


   router.put("/upload-image/:id", validateObjectIds, photoUpload.single("image"), updateRecipeImage)

router.get("/count", getRecipesCount)


   export default router