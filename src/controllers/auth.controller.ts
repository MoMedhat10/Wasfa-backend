import { Request, Response } from "express"
import asyncHandler from "express-async-handler";
import User, { validateRegisterUser, validateLoginUser } from "../models/user"
import bcrypt from "bcryptjs"
import VerificationToken from "../models/verificationToken"
import crypto from "crypto"
import { sendEmail } from "../utils/sendEmail";
import { generateAccessToken, generateRefreshToken } from "@utils/generateTokens";
import jwt from "jsonwebtoken";
import { UserType } from "@utils/generateTokens";
import { generateVerificationEmailTemplate } from "@utils/templates";

interface UserBody {
    username?: string;
    email?: string;
    password?: string;
    rememberMe?: boolean;
}


interface ResendEmailParams {
    userId: string;
}

/**
 * @desc    Register new user
 * @route   /api/auth/register
 * @method  POST
 * @access  public
 */
export const registerUser = asyncHandler(async (req: Request<{}, {}, UserBody>, res: Response) => {
    const { username, email, password } = req.body;
    //validation
    const result = validateRegisterUser(req.body);
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

    // check if the user is already registered
    let user = await User.findOne({ email });
    if (user) {
        res.status(400).json({ message: "user already exists." });
        return
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password!, salt);


    const newUser = new User({
        username,
        email,
        password: hashedPassword
    })
    await newUser.save();

    const verificationToken = await VerificationToken.create({
        userId: newUser._id,
        token: crypto.randomBytes(32).toString("hex")
    })


    const template = generateVerificationEmailTemplate({ username: newUser.username!, id: newUser._id.toString() }, verificationToken.token);

    await sendEmail({
        userEmail: email!,
        subject: "Verify your email",
        htmlContent: template,
        senderName: "Wasfa"
    })


    res.status(201).json({ message: "User registered successfully" })
})





/**
 * @desc     Login user
 * @route   /api/auth/login
 * @method  POST
 * @access  public
 */
export const loginUser = asyncHandler(async (req: Request<{}, {}, UserBody>, res: Response) => {
    const { email, password } = req.body;
    //validation
    const result = validateLoginUser(req.body);
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

    // check if the user is already registered
    let user = await User.findOne({ email });
    if (!user) {
        res.status(400).json({ message: "invalid email or password." });
        return
    }

    if (!user.isVerified) {
        res.status(400).json({ message: "please verify your account to login." });
        return
    }

    const isPasswordValid = await bcrypt.compare(password!, user.password);
    if (!isPasswordValid) {
        res.status(400).json({ message: "Invalid email or password." });
        return
    }

    const accessToken = generateAccessToken({ _id: user._id.toString(), isAdmin: user.isAdmin });
    const refreshToken = generateRefreshToken({ _id: user._id.toString(), isAdmin: user.isAdmin });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: `Welcome back ${user.username}!`,
        token: accessToken
    })
})




/**
 * @desc     refresh access token
 * @route   /api/auth/refresh-token
 * @method  POST
 * @access  private
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(401).json({ message: "No refresh token provided!" });
        return
    }

    try {
        const decodedPayLoad = jwt.verify(refreshToken, process.env.TOKENS_SECRET_KEY!) as UserType;
        const newAccessToken = generateAccessToken(decodedPayLoad);
        res.status(200).json({
            message: "Token refreshed successfully",
            token: newAccessToken
        })
    }
    catch {
        res.status(403).json({ message: "Invalid refresh token" })
    }
})


/**
 * @desc     logout
 * @route   /api/auth/logout
 * @method  POST
 * @access  private
 */
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(401).json({ message: "No refresh token provided!" });
        return
    }

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });

})



/**
 * @desc     verify user
 * @route   /api/auth/users/:userId/verify/:token
 * @method  GET
 * @access  public
 */
export const verifyUser = asyncHandler(async (req: Request<{ userId: string, token: string }>, res: Response) => {
    const { userId, token } = req.params;
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found!" });
        console.log("User not found!");
        return
    }

    const verificationToken = await VerificationToken.findOne({
        userId: user._id,
        token
    });

    if (!verificationToken) {
        res.status(400).json({ message: "Invalid link!" });
        console.log("Invalid link!");
        return
    }
    user.isVerified = true;
    await user.save();
    await verificationToken.deleteOne();
    res.status(200).json({ message: "User verified successfully!" });
})


/**
 * @desc     resend verification email
 * @route   /api/auth/resend-verification-token
 * @method  POST
 * @access  public
 */
export const resendVerificationToken = asyncHandler(async (req: Request<ResendEmailParams>, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        res.status(400).json({ message: "User ID is required!" });
        return
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found!" });
        return
    }

    if (user.isVerified) {
        res.status(400).json({ message: "User already verified!" });
        return
    }

    let verificationToken = await VerificationToken.findOne({
        userId: user._id,
    });

    if (!verificationToken) {
        verificationToken = await VerificationToken.create({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex")
        })
    }
    const template = generateVerificationEmailTemplate({ username: user.username!, id: user._id.toString() }, verificationToken.token);

    try {
        await sendEmail({
            userEmail: user.email!,
            subject: "Verify your email",
            htmlContent: template,
            senderName: "Wasfa"
        })
    }
    catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
            return
        }
        else {
            res.status(500).json({ message: "Something went wrong!" });
            return
        }
    }

    res.status(200).json({ message: "Verification email sent successfully!" });
})