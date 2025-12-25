import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User, { validateEmail, validateNewPassword } from "models/user";
import VerificationToken from "models/verificationToken";
import crypto from "crypto";
import { generateResetPasswordEmailTemplate } from "@utils/templates";
import { sendEmail } from "@utils/sendEmail";
import bcrypt from "bcryptjs";
import Activity from "../models/activity";






/**
 * @desc      sent reset password link
 * @route   /api/password/reset-link
 * @method  POST
 * @access  public
 */
export const sentResetPasswordLink = asyncHandler(async (req: Request<{}, {}, { email: string }>, res: Response) => {
    const { email } = req.body;

    const result = validateEmail(req.body);
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

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404).json({ message: "User not found!" });
        return;
    }

    let verificationToken = await VerificationToken.findOne({ userId: user._id });
    if (!verificationToken) {
        verificationToken = await VerificationToken.create({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex")
        })
    }

    const template = generateResetPasswordEmailTemplate({
        username: user.username,
        id: user._id.toString()
    }, verificationToken.token);

    try {
        await sendEmail({
            userEmail: email!,
            subject: "Reset Password",
            htmlContent: template,
            senderName: "Wasfa"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to send reset password link!" });
        return;
    }

    await Activity.create({
        user: user._id,
        action: "REQUESTED_RESET_PASSWORD",
        targetId: user._id,
        targetModel: "User",
        details: {
            message: `User ${user.username} requested a password reset link`
        }
    });

    res.status(200).json({ message: "Reset password link sent successfully!" });
})





/**
 * @desc     Get reset password link
 * @route   /api/password/reset-password/:userId/:token
 * @method  GET
 * @access  public
 */
export const getResetPasswordLink = asyncHandler(async (req: Request<{ userId: string, token: string }>, res: Response) => {
    const { userId, token } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found!" });
        return;
    }

    const verificationToken = await VerificationToken.findOne({ userId: user._id, token });
    if (!verificationToken) {
        res.status(400).json({ message: "Invalid link!" });
        return;
    }


    res.status(200).json({ message: "Link is valid!" });
})


/**
 * @desc      Reset password 
 * @route     /api/password/reset-password/:userId/:token
 * @method    POST
 * @access    public
 */
export const resetPassword = asyncHandler(async (req: Request<{ userId: string, token: string }, {}, { password: string }>, res: Response) => {
    const { userId, token } = req.params;
    const { password } = req.body;

    const result = validateNewPassword(req.body);
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

    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found!" });
        return;
    }

    const verificationToken = await VerificationToken.findOne({ userId: user._id, token });
    if (!verificationToken) {
        res.status(400).json({ message: "Invalid link!" });
        return;
    }

    if (!user.isVerified) {
        user.isVerified = true;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();
    await verificationToken.deleteOne();

    await Activity.create({
        user: user._id,
        action: "RESET_PASSWORD",
        targetId: user._id,
        targetModel: "User",
        details: {
            message: `User ${user.username} successfully reset their password`
        }
    });

    res.status(200).json({ message: "Password reset successfully!" });
})
