import { Request, Response } from "express"
import asyncHandler from "express-async-handler";
import Comment, { validateComment, validateOptionalComment } from "../models/comment";
import { Types } from "mongoose";
import Recipe from "models/recipe";
import User from "models/user";
import Activity from "../models/activity";
import { sortByType, sortType } from "@utils/types";




interface CommentData {
    recipeId: Types.ObjectId;
    userId: Types.ObjectId;
    body: string;
    rating: number;
}

interface CommentFilter {
    sortBy?: sortByType | "newest" | "oldest" | "high-rated" | "low-rated";
    sort?: sortType;
    page?: string;
    limit?: string;
}


/**
 * @desc    create new Comment
 * @route   /api/comments
 * @method  POST
 * @access  private (logged in users)
 */
export const createComment = asyncHandler(async (req: Request<{}, {}, CommentData>, res: Response) => {
    const { recipeId, userId, body, rating } = req.body;

    if (!Types.ObjectId.isValid(recipeId) || !Types.ObjectId.isValid(userId)) {
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



    const comment = await Comment.create({ recipeId, userId, body, username: user.username, rating });

    await Activity.create({
        user: userId,
        action: "CREATED_COMMENT",
        targetId: comment._id,
        targetModel: "Comment",
        details: {
            message: `User ${user.username} commented on recipe: ${recipe.name}`
        }
    });

    res.status(201).json(comment);
})



/**
 * @desc    get all comments
 * @route   /api/comments
 * @method  GET
 * @access  private (admin only)
 */
export const getAllComments = asyncHandler(async (req: Request<{}, {}, {}, CommentFilter>, res: Response) => {
    let { sortBy = "createdAt", sort = "desc", page = "1", limit = "10" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const limitNum = Number(limit);
    console.log(skip, limitNum);
    
    const sortQuery: any = {};

    if (sortBy === "newest") {
        sortQuery.createdAt = -1;
    } else if (sortBy === "oldest") {
        sortQuery.createdAt = 1;
    } else if (sortBy === "high-rated") {
        sortQuery.rating = -1;
    } else if (sortBy === "low-rated") {
        sortQuery.rating = 1;
    } else {
        sortQuery[sortBy as string] = sort === "asc" ? 1 : -1;
    }

    const comments = await Comment.find()
        .sort(sortQuery)
        .populate("userId", ["-password", "-isAdmin", "-isVerified", "-createdAt", "-updatedAt", "-__v"])
        .populate("recipeId", ["image", "premium", "_id", "name"]);

    res.status(200).json(comments);
})



/**
 * @desc    delete comment
 * @route   /api/comments/:id
 * @method  DELETE
 * @access  private (admin and logged in users)
 */
export const deleteComment = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id: commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        return;
    }

    if (req.user?._id.toString() !== comment.userId.toString() && !req.user!.isAdmin) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    await Comment.findByIdAndDelete(commentId);

    const recipe = await Recipe.findById(comment.recipeId);

    await Activity.create({
        user: req.user?._id,
        action: "DELETED_COMMENT",
        targetId: comment._id,
        targetModel: "Comment",
        details: {
            message: `Comment by ${comment.username} on recipe ${recipe?.name || 'Unknown'} was deleted by ${req.user?.isAdmin ? 'Admin' : 'User'}`
        }
    });

    res.status(200).json({ message: "Comment deleted successfully" });
})




//todo
/**
 * @desc    update comment
 * @route   /api/comments/:id
 * @method  PUT
 * @access  private (logged in users)
 */
export const updateComment = asyncHandler(async (req: Request<{ id: string }, {}, CommentData>, res: Response) => {
    const { id: commentId } = req.params;
    const { body } = req.body;
    const user = await User.findById(req.user?._id);


    const comment = await Comment.findById(commentId);
    if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        return;
    }

    const result = validateOptionalComment({ body });
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

    if (req.user?._id.toString() !== comment.userId.toString()) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, {
        $set: {
            body
        }
    }, { new: true });


    await Activity.create({
        user: req.user?._id,
        action: "UPDATED_COMMENT",
        targetId: updatedComment?._id,
        targetModel: "Comment",
        details: {
            message: `User ${user?.username} updated their comment`
        }
    });

    res.status(200).json(updatedComment);
})
