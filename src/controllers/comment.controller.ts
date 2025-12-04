import { Request, Response } from "express"
import asyncHandler from "express-async-handler";
import Comment, { validateComment } from "../models/comment";
import { Types } from "mongoose";
import Recipe from "models/recipe";
import User from "models/user";




interface CommentData {
    recipeId: Types.ObjectId;
    userId: Types.ObjectId;
    body: string;
}


/**
 * @desc    create new Comment
 * @route   /api/comments
 * @method  POST
 * @access  private (logged in users)
 */
export const createComment = asyncHandler(async (req: Request<{}, {}, CommentData>, res: Response) => {
    const { recipeId, userId, body } = req.body;

    if(!Types.ObjectId.isValid(recipeId) || !Types.ObjectId.isValid(userId)) {
        res.status(400).json({ message: "Invalid recipe or user ID" });
        return; 
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
        res.status(404).json({ message: "Recipe not found" });
        return;
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    const result = validateComment(req.body);
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



    const comment = await Comment.create({ recipeId, userId, body , username: user.username });
    res.status(201).json(comment);
})
