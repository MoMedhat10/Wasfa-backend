import { Request, Response } from "express"
import asyncHandler from "express-async-handler";
import User, { validateRegisterUser , validateLoginUser } from "../models/user"
import bcrypt from "bcryptjs"
import VerificationToken from "../models/verificationToken"
import crypto from "crypto"
import { sendEmail } from "../utils/sendEmail";
import { generateAccessToken, generateRefreshToken } from "@utils/generateTokens";

interface UserBody {
    username: string;
    email: string;
    password: string;
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
    const hashedPassword = await bcrypt.hash(password, salt);


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

    // create link
    const link = `${process.env.CLIENT_DOMAIN}/users/${newUser._id}/verify/${verificationToken.token}`;
    const template = `
     <div>
            <p> Click on the link below to verify your email </p>
            <a href="${link}"> Verify</a>
        </div>
    `
    await sendEmail({
        userEmail: email,
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
    const { email , password } = req.body;
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

    if(!user.isVerified)
    {
        res.status(400).json({message: "please verify your account to login."});
        return 
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(400).json({ message: "Invalid email or password." });
        return
    }

    const accessToken = generateAccessToken({ _id: user._id.toString(), isAdmin: user.isAdmin });
    const refreshToken = generateRefreshToken({ _id: user._id.toString(), isAdmin: user.isAdmin });

    res.cookie("refreshToken" , refreshToken , {
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