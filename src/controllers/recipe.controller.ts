import { Request, Response } from "express"
import asyncHandler from "express-async-handler";
import Recipe, { validateOptionalRecipe, validateRecipe } from "models/recipe";
import fs from "fs";
import path from "path";
import { cloudinaryRemoveImage, cloudinaryUploadImage } from "@utils/cloudinary";
import Comment from "models/comment";
import { sortByType, sortType, filterType } from "@utils/types";
import User from "models/user"
import Activity from "../models/activity";




interface RecipeFilter {
    sortBy?: sortByType;
    sort?: sortType;
    filter?: filterType;
    page?: number;
    limit?: number;
    ingredients?: string | string[];
}


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

    await Activity.create({
        user: req.user?._id,
        action: "CREATED_RECIPE",
        targetId: recipe._id,
        targetModel: "Recipe",
        details: {
            name: recipe.name,
            message: `Admin created a new recipe: ${recipe.name}`
        }
    });

    res.status(201).json(recipe);
})





/**
 * @desc   get recipes
 * @route   /api/recipes
 * @method  GET
 * @access  public 
 */
export const getRecipes = asyncHandler(async (req: Request<{}, {}, {}, RecipeFilter>, res: Response) => {
    let { sort = "asc", sortBy = "name", filter = "all", page = 1, limit = 6, ingredients } = req.query;

    let ingredientsArray: string[] = [];
    if (ingredients) {
        if (Array.isArray(ingredients)) {
            ingredientsArray = ingredients as string[];
        } else if (typeof ingredients === "string") {
            ingredientsArray = ingredients.split(",");
        }
    }

    const sanitizedIngredients = ingredientsArray.map(i => i.trim()).filter(i => i.length > 0);


    const skip = (Number(page) - 1) * Number(limit);
    const query: any = {};
    const sortQuery: any = {};

    if (filter === "quick") {
        query.cookTime = { $lte: 30 };
    }

    if (filter === "medium") {
        query.cookTime = { $gt: 30, $lte: 60 };
    }

    if (filter === "long") {
        query.cookTime = { $gt: 60 };
    }

    if (filter === "high-rated") {
        query.rating = { $gte: 4 };
    }

    if (sanitizedIngredients.length > 0) {
        query.ingredients = { $all: sanitizedIngredients };
    }

    sortQuery[sortBy] = sort === "asc" ? 1 : -1;

    const recipes = await Recipe.find(query).sort(sortQuery).skip(skip).limit(Number(limit)).populate("comments", ["-__v"]);
    const total = await Recipe.countDocuments(query);
    const totalPages = Math.ceil(total / Number(limit));


    res.status(200).json({
        recipes,
        total,
        totalPages,
        page,
        limit
    });
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
    const recipe = await Recipe.findById(id).populate("comments", ["-__v"]);
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


    await Activity.create({
        user: req.user?._id,
        action: "DELETED_RECIPE",
        targetId: recipe._id,
        targetModel: "Recipe",
        details: {
            name: recipe.name,
            message: `Admin deleted the recipe: ${recipe.name}`
        }
    });

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

    await Activity.create({
        user: req.user?._id,
        action: "UPDATED_RECIPE_IMAGE",
        targetId: recipe._id,
        targetModel: "Recipe",
        details: {
            imageUrl: image.secure_url,
            message: `Admin updated the image for recipe: ${recipe.name}`
        }
    });

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



    await Activity.create({
        user: req.user?._id,
        action: "UPDATED_RECIPE",
        targetId: updatedRecipe?._id,
        targetModel: "Recipe",
        details: {
            updates: req.body,
            message: `Admin updated details for recipe: ${updatedRecipe?.name}`
        }
    });

    res.status(200).json(updatedRecipe);
})






/**
 * @desc    toggle favorite recipe
 * @route   /api/recipes/favorite/:id
 * @method  PUT
 * @access  private (logged in users)
 */
export const toggleFavoriteRecipe = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id: recipeId } = req.params;
    const userId = req.user?._id;

    let user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
        res.status(404).json({ message: "Recipe not found" });
        return;
    }

    const isFavorite = user.favoriteRecipes.find(id => id.toString() === recipeId);
    if (isFavorite) {
        user = await User.findByIdAndUpdate(userId, { $pull: { favoriteRecipes: recipeId } }, { new: true });
    } else {
        user = await User.findByIdAndUpdate(userId, { $push: { favoriteRecipes: recipeId } }, { new: true });
    }

    res.status(200).json(user);
})
