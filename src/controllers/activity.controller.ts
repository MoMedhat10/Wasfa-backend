import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Activity from "../models/activity";

/**
 * @desc    Get recent activities (Admin only)
 * @route   GET /api/activities
 * @access  private (Admin only)
 */
export const getRecentActivities = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const activities = await Activity.find()
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(limit)
        .populate("user", "username email profilePhoto"); 

    const total = await Activity.countDocuments();

    res.status(200).json({
        activities,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    });
});
