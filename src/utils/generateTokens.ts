import jwt from "jsonwebtoken";

export type UserType = {
    _id: string,
    isAdmin: boolean
}
// edit this later
export const generateAccessToken = (user: UserType) => {
    return jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, process.env.TOKENS_SECRET_KEY!, {
        expiresIn: "30d",
    });
}



export const generateRefreshToken = (user: UserType) => {
    return jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, process.env.TOKENS_SECRET_KEY!, {
        expiresIn: "30d",
    });
}