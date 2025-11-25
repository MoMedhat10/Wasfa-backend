import jwt from "jsonwebtoken";

export type User = {
    _id: string,
    isAdmin: boolean
}

export const generateAccessToken = (user: User) => {
    return jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, process.env.TOKENS_SECRET_KEY!, {
        expiresIn: "15m",
    });
}



export const generateRefreshToken = (user: User) => {
    return jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, process.env.TOKENS_SECRET_KEY!, {
        expiresIn: "30d",
    });
}