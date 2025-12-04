import { createRecipe } from "@controllers/recipe.controller";
import express from "express";
import photoUpload from "@middlewares/imgUpload";
const router = express.Router();




router.route("/")
   .post(photoUpload.single("image") , createRecipe)




   export default router