import jwt from "jsonwebtoken";

export type UserType = {
    _id: string,
    isAdmin: boolean
}

export const generateAccessToken = (user: UserType) => {
    return jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, process.env.TOKENS_SECRET_KEY!, {
        expiresIn: "15m",
    });
}



export const generateRefreshToken = (user: UserType) => {
    return jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, process.env.TOKENS_SECRET_KEY!, {
        expiresIn: "30d",
    });
}