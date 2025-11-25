import { Document, Schema, model } from "mongoose";
import { z } from "zod";

type SubscriptionType = "FREE" | "BASIC" | "PRO"

interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    isVerified: boolean,
    subscription: SubscriptionType,
    isAdmin: boolean
}


const User = model<IUser>("User", new Schema<IUser>({
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
    isVerified: { type: Boolean, default: false },
    subscription: { type: String, enum: ["FREE", "BASIC", "PRO"], default: "FREE" },
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true }));


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


export const validateRegisterUser = (data: unknown) => {
    return userRegistrationSchema.safeParse(data)
}

export default User