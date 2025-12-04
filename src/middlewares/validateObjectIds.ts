import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";



const validateObjectIds = (req: Request<{id: string}>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
    }
    next();
}


export default validateObjectIds
