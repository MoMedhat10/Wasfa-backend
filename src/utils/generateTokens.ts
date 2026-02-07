import jwt from "jsonwebtoken";

export type UserType = {
    _id: string,
    isAdmin: boolean,
    isBanned?: boolean
}


export const generateAccessToken = (user: UserType) => {
    return jwt.sign({ _id: user._id, isAdmin: user.isAdmin, isBanned: user.isBanned }, process.env.TOKENS_SECRET_KEY!, {
        expiresIn: "5m",
    }); 
}


export const generateRefreshToken = (user: UserType) => {
    return jwt.sign({ _id: user._id, isAdmin: user.isAdmin, isBanned: user.isBanned }, process.env.TOKENS_SECRET_KEY!, {
        expiresIn: "30d",
    });
}