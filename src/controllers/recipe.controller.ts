import { Request, Response } from "express"
import asyncHandler from "express-async-handler";
import Recipe, { validateRecipe } from "models/recipe";
import fs from "fs";
import path from "path";
import { cloudinaryUploadImage } from "@utils/cloudinary";



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
 * @desc    create new post
 * @route   /api/posts
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