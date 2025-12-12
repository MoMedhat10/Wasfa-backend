import { createRecipe, deleteRecipe, getRecipe, getRecipes, getRecipesCount, updateRecipe, updateRecipeImage } from "@controllers/recipe.controller";
import express from "express";
import photoUpload from "@middlewares/imgUpload";
import validateObjectIds from "@middlewares/validateObjectIds";
import { adminRoute } from "@middlewares/protectedRoutes";
const router = express.Router();




router.route("/")
   .post( adminRoute ,photoUpload.single("image") , createRecipe)
   .get(getRecipes)


   router.route("/:id")
   .delete(validateObjectIds, adminRoute, deleteRecipe)
   .get(validateObjectIds, getRecipe)
   .put(validateObjectIds, adminRoute, updateRecipe)
 

   router.put("/upload-image/:id", adminRoute , validateObjectIds, photoUpload.single("image"), updateRecipeImage)

router.get("/count", adminRoute , getRecipesCount)


   export default router