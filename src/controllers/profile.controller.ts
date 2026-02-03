import { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import User from "../models/user"
import Activity from "../models/activity";





/**
 * @desc    Get user profile
 * @route   /api/profile/:id
 * @method  GET
 * @access  private (logged in users)
 */
export const getUserProfile = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id: userId } = req.params;
    const user = await User.findById(userId).select("-password -isAdmin -isVerified  -updatedAt -__v")
        .populate("comments")
        .populate("favoriteRecipes")
        .populate("subscription" , "user stripeSubscriptionId stripePriceId status currentPeriodStart currentPeriodEnd cancelAtPeriodEnd")


    if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
    }

    if (user._id.toString() !== req.user?._id.toString()) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }

    res.json(user);
})






/**
 * @desc    delete user profile
 * @route   /api/profile/:id
 * @method  DELETE
 * @access  private (admins)
 */
export const deleteUserProfile = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id: userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
    }

    if (!req.user || !req.user.isAdmin ) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }

    await User.findByIdAndDelete(userId);



    await Activity.create({
        user: userId,
        action: "DELETED_ACCOUNT",
        targetId: userId,
        targetModel: "User",
        details: {
            message: `User ${user.username} deleted their account`
        }
    });

    res.json({ message: 'User deleted', id: userId });
})






