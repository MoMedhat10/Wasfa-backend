
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/user";
import Activity from "../models/activity";


/**
 * @desc    Get all users
 * @route   /api/users
 * @method  GET
 * @access  private (admins)
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { search, role, status } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const query: any = {};

    if (search) {
        query.username = { $regex: search, $options: "i" };
    }

    if (role === "admin") {
        query.isAdmin = true;
    } else if (role === "user") {
        query.isAdmin = false;
    }

    if (status === "banned") {
        query.isBanned = true;
    } else if (status === "active") {
        query.isBanned = false;
    } else if (status === "verified") {
        query.isVerified = true;
    } else if (status === "unverified") {
        query.isVerified = false;
    }

    
    const users = await User.find(query)
        .select("-password -favoriteRecipes -updatedAt -__v")
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
        users,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    });
})



/** 
 * @desc    toggle ban user
 * @route   /api/users/toggle-ban/:id
 * @method  PUT
 * @access  private (Admins Only)
 */
export const toggleBanUser = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    if (user.isAdmin) {
        res.status(403).json({ message: "Cannot ban an admin" });
        return;
    }

    user.isBanned = !user.isBanned;
    await user.save();

    await Activity.create({
        user: req.user?._id,
        action: user.isBanned ? "BANNED_USER" : "UNBANNED_USER",
        targetId: user._id,
        targetModel: "User",
        details: {
            message: `Admin ${user.isBanned ? "banned" : "unbanned"} user ${user.username}`
        }
    });

    res.status(200).json({
        message: `User ${user.isBanned ? "banned" : "unbanned"} successfully`,
        isBanned: user.isBanned
    });
});
