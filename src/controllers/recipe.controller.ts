import { Request, Response } from "express"
import asyncHandler from "express-async-handler";
import Recipe, { validateRecipe } from "models/recipe";
import fs from "fs";
import path from "path";
import { cloudinaryRemoveImage, cloudinaryUploadImage } from "@utils/cloudinary";



interface RecipeData {
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    level: string;
    rating: number;
    cookTime: number;
    servings: number
}


const imgDir = path.join(__dirname, "../images");



/**
 * @desc    create new Recipe
 * @route   /api/recipes
 * @method  POST
 * @access  private (admin only)
 */
export const createRecipe = asyncHandler(async (req: Request<{}, {}, RecipeData>, res: Response) => {

    req.body.rating = +req.body.rating;
    req.body.cookTime = +req.body.cookTime;
    req.body.servings = +req.body.servings;
    const { name, description, ingredients, instructions, level, rating, cookTime, servings } = req.body;



    // image validation 
    if (!req.file) {
        res.status(400).json({ message: "No image provided." })
        return
    }

    //validation
    const result = validateRecipe(req.body);
    if (!result.success) {
        const formattedErrors = result.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
        }));

        res.status(400).json({
            message: "Validation failed",
            errors: formattedErrors
        });
        return;
    }

    const imagePath = path.join(imgDir, req.file.filename);
    const image = await cloudinaryUploadImage(imagePath);

    const recipe = await Recipe.create({
        name,
        description,
        ingredients,
        instructions,
        rating,
        cookTime,
        servings,
        level,
        image: {
            url: image.secure_url,
            public_id: image.public_id
        }
    })

    fs.unlinkSync(imagePath);

    res.status(201).json(recipe);
})





/**
 * @desc    get  recipes count
 * @route   /api/recipes/count
 * @method  GET
 * @access  public
 */
export const getRecipesCount = asyncHandler(async (req: Request, res: Response) => {
    const count = await Recipe.countDocuments();
    res.status(200).json({ count });
})




/**
 * @desc    delete recipes
 * @route   /api/recipes/:id
 * @method  DELETE
 * @access  private (admin only)
 */
export const deleteRecipe = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    if (!recipe) {
        res.status(404).json({ message: "Recipe not found" });
        return;
    }

      await cloudinaryRemoveImage(recipe.image.public_id);
      await Recipe.findByIdAndDelete(id);


    res.status(200).json({ message: "Recipe deleted successfully" });
})
