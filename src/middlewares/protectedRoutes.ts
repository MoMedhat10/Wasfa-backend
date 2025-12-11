import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UserType } from "@utils/generateTokens"




export const protectedRoute = (req: Request , res: Response , next: NextFunction) => {

    const accessToken = req.headers["authorization"] ;

    if (!accessToken || !accessToken.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided, access denied" });
    }

    const token = accessToken.split(" ")[1];

    try{
        const decodedPayLoad = jwt.verify(token! , process.env.TOKENS_SECRET_KEY!) as UserType ;
        req.user = decodedPayLoad;
        return next();
    }
    catch {
        res.status(401).json({message: "invalid token , access denied."});
        return 
    }
}


export const adminRoute = (req: Request , res: Response , next: NextFunction) => {

     protectedRoute(req , res , () => {

        if (!req.user || !req.user.isAdmin) {
            return res.status(401).json({ message: " admins only, Access denied" });
        }
        return next();
     
    })
}


 

