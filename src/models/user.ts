import { Document, Schema, model } from "mongoose";
import { z } from "zod";

type SubscriptionType = "FREE" | "BASIC" | "PRO"

interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    isVerified: boolean,
    subscription: SubscriptionType,
    isAdmin: boolean,
    favoriteRecipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }]
}
 

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    favoriteRecipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    isVerified: { type: Boolean, default: false },
    subscription: { type: String, enum: ["FREE", "BASIC", "PRO"], default: "FREE" },
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })


userSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "userId",
})


const User = model<IUser>("User", userSchema);



const userRegistrationSchema = z.object({
    username: z.string()
        .min(2, "Username must be at least 2 characters long")
        .max(20, "Username cannot exceed 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .trim(),

    email: z.string()
        .email("Invalid email address")
        .trim(),

    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        })
        .trim()
});


const userLoginSchema = z.object({
    email: z.string().email("Invalid email address").trim(),
    password: z.string().min(8, "Password must be at least 8 characters long").trim(),
})


const validateEmailSchema = z.object({
    email: z.string().email("Invalid email address").trim(),
})


const validateNewPasswordSchema = z.object({
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        })
        .trim()
})



export const validateLoginUser = (data: unknown) => {
    return userLoginSchema.safeParse(data);
}

export const validateRegisterUser = (data: unknown) => {
    return userRegistrationSchema.safeParse(data)
}

export const validateEmail = (data: unknown) => {
    return validateEmailSchema.safeParse(data);
}

export const validateNewPassword = (data: unknown) => {
    return validateNewPasswordSchema.safeParse(data);
}



export default User