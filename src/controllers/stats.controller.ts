import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/user";
import Recipe from "../models/recipe";
import Comment from "../models/comment";
import Subscription from "models/subscription";

/**
 * @desc    Get dashboard stats (users, recipes, comments)
 * @route   GET /api/stats
 * @access  private (Admin only)
 */
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const usersCount = await User.countDocuments();
    const recipesCount = await Recipe.countDocuments();
    const commentsCount = await Comment.countDocuments();
    const subscriptionsCount = await Subscription.countDocuments({
        status: "active",
    });

    res.status(200).json({
        usersCount,
        recipesCount,
        commentsCount,
        subscriptionsCount
    });
});
