import { Request, Response } from "express"
import asyncHandler from "express-async-handler";
import Recipe, { validateOptionalRecipe, validateRecipe } from "models/recipe";
import fs from "fs";
import path from "path";
import { cloudinaryRemoveImage, cloudinaryUploadImage } from "@utils/cloudinary";
import Comment from "models/comment";


//todo protecting routes and adding filters and pagination


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
 * @desc   get recipes
 * @route   /api/recipes
 * @method  GET
 * @access  public 
 */
export const getRecipes = asyncHandler(async (req: Request, res: Response) => {
    //todo adding filter and pagination
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
})





/**
 * @desc    get  recipes count
 * @route   /api/recipes/count
 * @method  GET
 * @access  private (admin only)
 */
export const getRecipesCount = asyncHandler(async (req: Request, res: Response) => {
    const count = await Recipe.countDocuments();
    res.status(200).json({ count });
})





/**
 * @desc    get single recipe
 * @route   /api/recipes/:id
 * @method  GET
 * @access  public
 */
export const getRecipe = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const recipe = await Recipe.findById(id).populate("comments" , ["-__v"]);
    if (!recipe) {
        res.status(404).json({ message: "Recipe not found" });
        return;
    }
    res.status(200).json(recipe);
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
    await Comment.deleteMany({ recipeId: id });


    res.status(200).json({ message: "Recipe deleted successfully" });
})




/**
 * @desc     update recipe image
 * @route   /api/recipes/upload-image/:recipeId  ||  [:id]
 * @method   PUT
 * @access   private  (admin only)
 */
export const updateRecipeImage = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    if (!recipe) {
        res.status(404).json({ message: "Recipe not found" });
        return;
    }

    if (!req.file) {
        res.status(400).json({ message: "No image provided." })
        return
    }

    const imagePath = path.join(imgDir, req.file.filename);
    const image = await cloudinaryUploadImage(imagePath);

    await cloudinaryRemoveImage(recipe.image.public_id);
    recipe.image = {
        url: image.secure_url,
        public_id: image.public_id
    }
    await recipe.save();

    fs.unlinkSync(imagePath);

    res.status(200).json(recipe);
})





/**
 * @desc    update recipe
 * @route   /api/recipes/:id
 * @method  PUT
 * @access  private (admin only)
 */
export const updateRecipe = asyncHandler(async (req: Request<{ id: string }, {}, RecipeData>, res: Response) => {
    const { name, description, ingredients, instructions, level, rating, cookTime, servings } = req.body;

    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    if (!recipe) {
        res.status(404).json({ message: "Recipe not found" });
        return;
    }

    const result = validateOptionalRecipe(req.body);
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

    const updatedRecipe = await Recipe.findByIdAndUpdate(id, {
        name,
        description,
        ingredients,
        instructions,
        level,
        rating,
        cookTime,
        servings
    }, { new: true });



    res.status(200).json(updatedRecipe);
})